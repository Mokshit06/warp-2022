import { type AppType } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { extendTheme } from '@chakra-ui/react';
import 'mapbox-gl/dist/mapbox-gl.css';

import { trpc } from '../utils/trpc';

// import '../styles/globals.css';
import Script from 'next/script';
import Layout from '../components/layout';

const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
  },
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Script
          src="https://slowe.github.io/VirtualSky/stuquery.min.js"
          defer
        />
        <Script
          src="https://slowe.github.io/VirtualSky/virtualsky.min.js"
          defer
        />
      </ChakraProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
