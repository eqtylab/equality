import * as React from 'react';

import { PORTAL_ROOT_ID } from './portal-container';

const Portal = React.forwardRef<HTMLDivElement>((_props, ref) => {
  return <div id={PORTAL_ROOT_ID} ref={ref} />;
});
Portal.displayName = 'Portal';

export { Portal };
