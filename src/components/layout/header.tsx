interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center h-14 px-4 border-b bg-background shrink-0">
      <h1 className="font-semibold text-sm">{title}</h1>
    </header>
  )
}
