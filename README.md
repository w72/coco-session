# coco

coco session middleware

```typescript
import { App, Router } from "@w72/coco";
import { session } from "@w72/coco-session";

const router = new Router();

router.get("/", {}, (ctx) => {
  ctx.session.test = 1234;
  return `hello world`;
});

router.get("/clear", {}, (ctx) => {
  ctx.session = {};
  return `clear`;
});

const app = new App();

app.use(session());
app.use(router.middleware());
app.listen(8080);

app.log.info("Server starting at http://localhost:8080");
```
