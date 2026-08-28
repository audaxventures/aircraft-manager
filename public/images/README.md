# Images

Drop logo and photo files in this folder (or `public/` directly). Next.js
serves everything under `public/` as static files at the site root, so
`public/images/logo.png` is reachable at `/images/logo.png` and can be
referenced in code as:

```tsx
<img src="/images/logo.png" alt="..." />
```

or with Next's optimized `<Image>` component:

```tsx
import Image from "next/image";
<Image src="/images/logo.png" alt="..." width={200} height={60} />
```
