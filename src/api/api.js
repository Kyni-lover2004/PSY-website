import { supabase } from '../lib/supabase';

// Слой данных поверх Supabase.
// Интерфейс и форма ответов повторяют старый REST API (axios): каждая функция
// возвращает { data }, а при ошибке бросает объект с response.status и
// response.data.detail — существующие страницы работают без изменений.

function apiError(status, detail) {
  const error = new Error(detail);
  error.response = { status, data: { detail } };
  return error;
}

function ok(data) {
  return { data };
}

// Логин может содержать кириллицу, а email в Supabase Auth — нет.
// Поэтому email детерминированно выводится из логина через SHA-256.
// Домен должен реально существовать в DNS (Supabase отклоняет выдуманные),
// письма на него не отправляются — подтверждение email отключено.
async function loginToEmail(login) {
  const normalized = login.trim().toLowerCase();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `u_${hex.slice(0, 32)}@psy-rzn.vercel.app`;
}

async function fetchOwnProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw apiError(500, 'Не удалось загрузить профиль');
  return data;
}

function buildAuthPayload(session, profile) {
  return {
    access_token: session?.access_token || null,
    token_type: 'bearer',
    user: {
      id: profile.id,
      login: profile.login,
      telegram: profile.telegram,
      name: profile.login,
      gender: profile.gender,
      orientation: profile.orientation,
      role: profile.role,
      created_at: profile.created_at,
    },
    compatibility_code: profile.compatibility_code,
  };
}

async function requireSession() {
  const { data } = await supabase.auth.getSession();
  if (!data?.session) throw apiError(401, 'Требуется авторизация');
  return data.session;
}

function rpcErrorDetail(error, fallback) {
  // Ошибки, брошенные в plpgsql через raise exception, приходят в error.message
  return error?.message && !error.message.startsWith('TypeError')
    ? error.message
    : fallback;
}

// === AUTH ===
export const authAPI = {
  register: async ({ login, password, gender = null, orientation = null }) => {
    const cleanLogin = login.trim();

    const { data: exists, error: existsError } = await supabase.rpc('login_exists', {
      p_login: cleanLogin,
    });
    if (!existsError && exists) {
      throw apiError(400, 'Пользователь уже существует');
    }

    const email = await loginToEmail(cleanLogin);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { login: cleanLogin, gender, orientation } },
    });
    if (error) {
      if (error.message?.includes('already registered')) {
        throw apiError(400, 'Пользователь уже существует');
      }
      throw apiError(400, error.message || 'Ошибка регистрации');
    }
    if (!data.session) {
      throw apiError(
        400,
        'Регистрация создана, но сессия не получена. Отключите подтверждение email в настройках Supabase (Authentication -> Providers -> Email -> Confirm email).'
      );
    }

    const profile = await fetchOwnProfile(data.user.id);
    return ok(buildAuthPayload(data.session, profile));
  },

  login: async ({ login, password }) => {
    const email = await loginToEmail(login);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw apiError(401, 'Неверный логин или пароль');
    }
    const profile = await fetchOwnProfile(data.user.id);
    return ok(buildAuthPayload(data.session, profile));
  },

  me: async () => {
    const session = await requireSession();
    const profile = await fetchOwnProfile(session.user.id);
    return ok(buildAuthPayload(session, profile));
  },

  refresh: async () => {
    const session = await requireSession();
    const profile = await fetchOwnProfile(session.user.id);
    return ok(buildAuthPayload(session, profile));
  },

  logout: async () => {
    await supabase.auth.signOut();
    return ok({ success: true });
  },
};

// === QUESTIONS ===
export const questionsAPI = {
  getQuestions: async (gender) => {
    if (!['male', 'female'].includes(gender)) {
      throw apiError(400, 'Неверный параметр пола');
    }
    const { data, error } = await supabase
      .from('questions')
      .select('id, text, archetype_code')
      .eq('gender_type', gender)
      .eq('is_active', true)
      .order('order_index');
    if (error) throw apiError(500, 'Ошибка загрузки вопросов');
    return ok(data);
  },
};

// === TEST ===
export const testAPI = {
  complete: async ({ session_id, answers, gender }) => {
    await requireSession();
    const { data, error } = await supabase.rpc('complete_test', {
      p_gender: gender,
      p_answers: answers,
      p_session_id: session_id || null,
    });
    if (error) {
      throw apiError(500, rpcErrorDetail(error, 'Ошибка при сохранении результатов'));
    }
    return ok(data);
  },

};

// === PROFILE (результаты по коду) ===
export const profileAPI = {
  getProfile: async (code) => {
    const { data, error } = await supabase.rpc('get_profile_by_code', { p_code: code });
    if (error) throw apiError(500, rpcErrorDetail(error, 'Ошибка загрузки'));
    if (!data) throw apiError(404, 'Профиль не найден');
    return ok(data);
  },
};

// === CONSULTATION ===
export const consultationAPI = {
  create: async (data) => {
    const { data: row, error } = await supabase
      .from('consultations')
      .insert({
        user_id: data.user_id || null,
        name: data.name,
        telegram: data.telegram || null,
        category: data.category || null,
        topic: data.topic || null,
        request_text: data.request_text,
      })
      .select('id')
      .single();
    if (error) throw apiError(500, 'Не удалось отправить заявку');
    return ok({ message: 'Заявка отправлена', id: row.id });
  },
};

// === COMMENTS ===
export const commentsAPI = {
  create: async ({ content, target_type = 'general', target_id = null, parent_id = null }) => {
    const session = await requireSession();
    const profile = await fetchOwnProfile(session.user.id);
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: session.user.id,
        user_login: profile.login,
        content,
        target_type,
        target_id,
        parent_id,
      })
      .select('*')
      .single();
    if (error) throw apiError(500, 'Не удалось создать комментарий');
    return ok(data);
  },

  getAll: async (targetType = 'general', targetId = null) => {
    let query = supabase
      .from('comments')
      .select('*')
      .eq('target_type', targetType)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    if (targetId !== null) query = query.eq('target_id', targetId);
    const { data, error } = await query;
    if (error) throw apiError(500, 'Ошибка загрузки комментариев');
    return ok(data);
  },

  getOne: async (commentId) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .eq('is_deleted', false)
      .single();
    if (error) throw apiError(404, 'Комментарий не найден');
    return ok(data);
  },

  update: async (commentId, { content }) => {
    const { data, error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select('id, content, updated_at')
      .single();
    if (error) throw apiError(403, 'Не удалось обновить комментарий');
    return ok(data);
  },

  delete: async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    if (error) throw apiError(403, 'Не удалось удалить комментарий');
    return ok({ message: 'Комментарий удален', comment_id: commentId });
  },
};

// === ADMIN ===
export const adminAPI = {
  getDashboard: async () => {
    const [users, consultations, newConsultations, tests, results, recentConsultations, recentUsers] =
      await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('consultations').select('id', { count: 'exact', head: true }),
        supabase
          .from('consultations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new'),
        supabase.from('tests').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('test_results').select('id', { count: 'exact', head: true }),
        supabase
          .from('consultations')
          .select('id, user_id, name, telegram, category, topic, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('profiles')
          .select('id, login, telegram, role, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

    const firstError = [users, consultations, newConsultations, tests, results, recentConsultations, recentUsers]
      .find((r) => r.error);
    if (firstError) throw apiError(403, 'Доступ запрещен');

    return ok({
      stats: {
        total_users: users.count ?? 0,
        total_consultations: consultations.count ?? 0,
        new_consultations: newConsultations.count ?? 0,
        total_tests: tests.count ?? 0,
        total_results: results.count ?? 0,
      },
      recent_consultations: recentConsultations.data ?? [],
      recent_users: recentUsers.data ?? [],
    });
  },

  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, login, telegram, gender, role, created_at, is_active, compatibility_code')
      .order('created_at', { ascending: false });
    if (error) throw apiError(403, 'Доступ запрещен');
    return ok(data);
  },

  updateUserRole: async (userId, role) => {
    const { error } = await supabase.rpc('admin_set_role', {
      p_user_id: userId,
      p_role: role,
    });
    if (error) throw apiError(403, rpcErrorDetail(error, 'Не удалось изменить роль'));
    return ok({ message: `Роль изменена на '${role}'`, user_id: userId });
  },

  deleteUser: async (userId) => {
    const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
    if (error) throw apiError(403, rpcErrorDetail(error, 'Не удалось удалить пользователя'));
    return ok({ message: 'Пользователь удален', user_id: userId });
  },

  getTestResults: async () => {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .order('completed_at', { ascending: false });
    if (error) throw apiError(403, 'Доступ запрещен');
    return ok(
      (data ?? []).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        user_login: r.user_login,
        user_telegram: r.user_telegram,
        test_type: r.test_type,
        gender: r.gender,
        archetype_code: r.archetype_result,
        archetype_name: r.archetype_name,
        total_score: r.total_score,
        scores_breakdown:
          typeof r.scores_breakdown === 'string'
            ? r.scores_breakdown
            : JSON.stringify(r.scores_breakdown),
        result_text: r.result_text,
        completed_at: r.completed_at,
      }))
    );
  },

  getConsultations: async () => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw apiError(403, 'Доступ запрещен');
    return ok(
      (data ?? []).map((c) => ({
        id: c.id,
        user_id: c.user_id,
        name: c.name,
        telegram: c.telegram,
        category: c.category,
        topic: c.topic,
        request: c.request_text,
        status: c.status,
        created_at: c.created_at,
      }))
    );
  },

  updateConsultationStatus: async (id, status) => {
    const { error } = await supabase
      .from('consultations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw apiError(403, 'Не удалось обновить статус');
    return ok({ message: 'Статус обновлен', consultation_id: id, new_status: status });
  },

  getQuestions: async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('id, gender_type, text, archetype_code, order_index, is_active')
      .order('gender_type')
      .order('order_index');
    if (error) throw apiError(403, 'Доступ запрещен');
    return ok(data);
  },

  getArchetypes: async () => {
    const { data, error } = await supabase
      .from('archetypes')
      .select('*')
      .order('code');
    if (error) throw apiError(500, 'Ошибка загрузки архетипов');
    return ok(data);
  },

  getTests: async () => {
    const { data, error } = await supabase
      .from('tests')
      .select('id, title, description, category, created_at')
      .eq('is_active', true)
      .order('created_at');
    if (error) throw apiError(500, 'Ошибка загрузки тестов');
    return ok(data);
  },

  createTest: async ({ title, description, category }) => {
    const { data, error } = await supabase
      .from('tests')
      .insert({ title, description: description || null, category: category || null })
      .select('id, title')
      .single();
    if (error) throw apiError(403, 'Не удалось создать тест');
    return ok({ message: 'Тест создан', test_id: data.id, title: data.title });
  },

  deleteTest: async (testId) => {
    const { error } = await supabase.from('tests').delete().eq('id', testId);
    if (error) throw apiError(403, 'Не удалось удалить тест');
    return ok({ message: 'Тест удален', test_id: testId });
  },

  getTestQuestions: async (testId) => {
    const { data, error } = await supabase
      .from('test_questions')
      .select('id, text, order_index')
      .eq('test_id', testId)
      .eq('is_active', true)
      .order('order_index');
    if (error) throw apiError(500, 'Ошибка загрузки вопросов');
    return ok(data);
  },

  createQuestion: async ({ test_id, text, order_index }) => {
    const { data, error } = await supabase
      .from('test_questions')
      .insert({ test_id, text, order_index })
      .select('id')
      .single();
    if (error) throw apiError(403, 'Не удалось добавить вопрос');
    return ok({ message: 'Вопрос добавлен', question_id: data.id });
  },

  deleteQuestion: async (questionId) => {
    const { error } = await supabase.from('test_questions').delete().eq('id', questionId);
    if (error) throw apiError(403, 'Не удалось удалить вопрос');
    return ok({ message: 'Вопрос удален', question_id: questionId });
  },

  createAnswer: async ({ question_id, text, score, order_index }) => {
    const { data, error } = await supabase
      .from('answer_options')
      .insert({ question_id, text, score, order_index })
      .select('id')
      .single();
    if (error) throw apiError(403, 'Не удалось добавить вариант');
    return ok({ message: 'Вариант добавлен', answer_id: data.id });
  },

  getAnswers: async (questionId) => {
    const { data, error } = await supabase
      .from('answer_options')
      .select('id, text, score, order_index')
      .eq('question_id', questionId)
      .eq('is_active', true)
      .order('order_index');
    if (error) throw apiError(500, 'Ошибка загрузки вариантов');
    return ok(data);
  },

  deleteAnswer: async (answerId) => {
    const { error } = await supabase.from('answer_options').delete().eq('id', answerId);
    if (error) throw apiError(403, 'Не удалось удалить вариант');
    return ok({ message: 'Вариант удален', answer_id: answerId });
  },

  getAllComments: async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw apiError(403, 'Доступ запрещен');
    return ok(data);
  },

  deleteCommentAdmin: async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    if (error) throw apiError(403, 'Не удалось удалить комментарий');
    return ok({ message: 'Комментарий удален администратором', comment_id: commentId });
  },
};

export default { authAPI, questionsAPI, testAPI, profileAPI, consultationAPI, commentsAPI, adminAPI };
