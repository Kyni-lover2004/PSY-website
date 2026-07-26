-- Миграция: удаление функционала проверки совместимости.
-- Выполните ОДИН РАЗ в SQL Editor, если схема уже была применена раньше
-- (для новых установок ничего делать не нужно — schema.sql уже обновлён).

drop function if exists public.check_compatibility(text, text);
drop function if exists public.save_results_to_account(text);
drop table if exists public.couples;
