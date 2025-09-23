# Signup Assumptions

- Auth: Clerk handles sign in and returns to the pending upgrade intent.

- Billing: Stripe (or equivalent). Post-checkout webhook sets the plan on the selected account/org.

- Multi-account users: prompt to pick which account to upgrade; default to current context if only one.

- Already on plan: short-circuit to billing settings instead of a broken checkout.

- Post-success: always route to New Song to keep momentum; Pro/Publisher features are enabled by plan flags.

= Emails: send receipt and plan change confirmation
