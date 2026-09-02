import { NotFound } from '@eqtylab/equality';

/**
 * `NotFound`'s onHomeClick defaults to `window.location.href = '/'`, which
 * ignores `base` -- so a subpath or versioned deploy would send readers to the
 * wrong origin path. Pass it explicitly.
 */
export default function NotFoundBody({ homeHref }: { homeHref: string }) {
  return (
    <NotFound
      onHomeClick={() => {
        window.location.href = homeHref;
      }}
    />
  );
}
