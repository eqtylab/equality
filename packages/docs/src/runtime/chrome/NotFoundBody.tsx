import { NotFound } from '@eqtylab/equality';

/** `NotFound`'s default onHomeClick ignores `base`, so pass the href explicitly. */
export default function NotFoundBody({ homeHref }: { homeHref: string }) {
  return (
    <NotFound
      onHomeClick={() => {
        window.location.href = homeHref;
      }}
    />
  );
}
