export default {
  async fetch(request, env, ctx) {
    // Esta linha mágica diz ao Worker para entregar seus arquivos estáticos (HTML/CSS)
    // que estão configurados na opção 'assets' do wrangler.jsonc
    return env.ASSETS.fetch(request);
  },
};
