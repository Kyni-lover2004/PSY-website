import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Comments = ({ targetType = 'general', targetId = null }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    loadComments();
  }, [targetType, targetId]);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await commentsAPI.getAll(targetType, targetId);
      setComments(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
      setError('Не удалось загрузить комментарии');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentsAPI.create({
        content: newComment.trim(),
        target_type: targetType,
        target_id: targetId,
        parent_id: null
      });
      setNewComment('');
      loadComments();
    } catch (err) {
      console.error('Ошибка создания комментария:', err);
      setError('Не удалось создать комментарий');
    }
  };

  const handleReply = async (commentId) => {
    if (!replyContent.trim()) return;

    try {
      await commentsAPI.create({
        content: replyContent.trim(),
        target_type: targetType,
        target_id: targetId,
        parent_id: commentId
      });
      setReplyContent('');
      setReplyTo(null);
      loadComments();
    } catch (err) {
      console.error('Ошибка ответа на комментарий:', err);
      setError('Не удалось создать ответ');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить комментарий?')) return;

    try {
      await commentsAPI.delete(commentId);
      loadComments();
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
      setError('Не удалось удалить комментарий');
    }
  };

  const getReplies = (parentId) => {
    return comments.filter(c => c.parent_id === parentId);
  };

  const rootComments = comments.filter(c => !c.parent_id);

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Загрузка комментариев...</div>;
  }

  return (
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Комментарии ({comments.length})
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      {/* Форма создания комментария */}
      {isAuthenticated ? (
        <form onSubmit={handleCreateComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                       transition-colors disabled:opacity-50"
            disabled={!newComment.trim()}
          >
            Отправить
          </button>
        </form>
      ) : (
        <p className="mb-4 text-gray-500 dark:text-gray-400">
          <a href="/login" className="text-blue-600 hover:underline">Войдите</a>,
          чтобы оставить комментарий
        </p>
      )}

      {/* Список комментариев */}
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Комментариев пока нет. Будьте первым!
          </p>
        ) : (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              onReply={setReplyTo}
              onDelete={handleDelete}
              onSendReply={handleReply}
              currentUserId={user?.id}
              replyContent={replyTo === comment.id ? replyContent : ''}
              setReplyContent={setReplyContent}
              isAuthenticated={isAuthenticated}
            />
          ))
        )}
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  replies,
  onReply,
  onDelete,
  onSendReply,
  currentUserId,
  replyContent,
  setReplyContent,
  isAuthenticated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleEdit = async () => {
    try {
      await commentsAPI.update(comment.id, { content: editContent });
      comment.content = editContent;
      setIsEditing(false);
    } catch (err) {
      console.error('Ошибка редактирования:', err);
    }
  };

  const isAuthor = currentUserId && comment.user_id === currentUserId;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {comment.user_login}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {new Date(comment.created_at).toLocaleString('ru-RU')}
          </span>
        </div>
        {isAuthor && (
          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Редактировать
              </button>
            )}
            <button
              onClick={() => onDelete(comment.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mb-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Сохранить
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 mb-2">{comment.content}</p>
      )}

      {/* Кнопка ответа */}
      {isAuthenticated && !replyTo && (
        <button
          onClick={() => onReply(comment.id)}
          className="text-sm text-blue-600 hover:underline"
        >
          Ответить
        </button>
      )}

      {/* Форма ответа */}
      {replyTo === comment.id && (
        <div className="mt-3 ml-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Ответ пользователю ${comment.user_login}...`}
            rows={2}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded
                       bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onSendReply(comment.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              disabled={!replyContent.trim()}
            >
              Отправить
            </button>
            <button
              onClick={() => {
                onReply(null);
                setReplyContent('');
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Ответы на комментарий */}
      {replies.length > 0 && (
        <div className="mt-4 ml-6 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              onReply={onReply}
              onDelete={onDelete}
              onSendReply={onSendReply}
              currentUserId={currentUserId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
