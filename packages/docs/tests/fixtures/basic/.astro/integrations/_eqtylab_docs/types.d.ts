declare module 'virtual:eqty-docs/config' {
  const config: import('@eqtylab/docs').DocsConfig & {
    env: import('@eqtylab/docs').DocsEnv;
    ownedByConsumer: string[];
  };
  export default config;
}
