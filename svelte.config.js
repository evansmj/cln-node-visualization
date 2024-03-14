import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
 
/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: preprocess(),
  kit: {
    adapter: adapter({
      runtime: 'nodejs18.x',
    }),
  },
};
