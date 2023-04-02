import { Form } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <Form method="post" action="/admin/login">
      <button type="submit">Login</button>
    </Form>
  );
}
