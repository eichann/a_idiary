-- ユーザープロファイルテーブルの作成
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーの設定
alter table profiles enable row level security;

create policy "プロフィール参照ポリシー"
  on profiles for select
  using (auth.uid() = id);

create policy "プロフィール更新ポリシー"
  on profiles for update
  using (auth.uid() = id);

-- プロフィール自動作成トリガー
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 
