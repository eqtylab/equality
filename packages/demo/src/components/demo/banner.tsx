import { Banner, Button } from "@eqtylab/equality";

export function BannerActionDemo() {
  return (
    <Banner
      variant="danger"
      icon="Ban"
      action={
        <Button variant="link" size="sm">
          View Certification
        </Button>
      }
    >
      This certification was revoked.
    </Banner>
  );
}
