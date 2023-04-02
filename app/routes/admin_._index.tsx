import { Form } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <>
      <h1>ItsAydrian Stream Admin</h1>
      <Form method="post" action="/admin/login">
        <button type="submit">Login</button>
      </Form>
    </>
  );
}
