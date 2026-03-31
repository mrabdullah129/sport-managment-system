create table if not exists public.students (
  id bigint generated always as identity primary key,
  student_id text unique not null,
  name text not null,
  roll_no text unique not null,
  class text not null,
  phone text not null,
  created_at timestamptz default now()
);

create table if not exists public.items (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  total_quantity integer not null check (total_quantity >= 0),
  available_quantity integer not null check (available_quantity >= 0),
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students(id) on delete restrict,
  item_id bigint not null references public.items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  issue_date timestamptz not null,
  return_date timestamptz,
  status text not null default 'issued' check (status in ('issued', 'returned')),
  created_at timestamptz default now()
);

create index if not exists idx_transactions_student_status on public.transactions(student_id, status);
create index if not exists idx_transactions_item_status on public.transactions(item_id, status);
create index if not exists idx_students_roll on public.students(roll_no);
create index if not exists idx_items_category on public.items(category);
