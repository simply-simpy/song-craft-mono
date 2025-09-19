import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/accounts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/accounts"!</div>
}
