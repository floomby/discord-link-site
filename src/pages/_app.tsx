import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";

import { api } from "~/utils/api";

import "~/styles/globals.css";
// import "react-tooltip/dist/react-tooltip.css";

import { NotificationProvider } from "~/lib/notifications";
// import Header from "~/components/Header";
import NotificationList from "~/components/NotificationList";
import WidthProvider from "~/lib/width";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { mainnet } from "@wagmi/core/chains";

export const { chains, provider } = configureChains(
  [mainnet],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <NotificationProvider>
      <WagmiConfig client={client}>
        <SessionProvider session={session}>
          <WidthProvider>
            <div className="absolute inset-0 min-h-screen min-w-max text-black dark:text-white">
              {/* <Header /> */}
              <DefaultSeo
                openGraph={{
                  type: "website",
                  locale: "en_US",
                  url: "https://www.social-link.xyz/",
                  siteName: "Social Link",
                  images: [
                    {
                      url: "https://www.social-link.xyz/social-link.png",
                      alt: "Social Link",
                    },
                  ],
                }}
                // twitter={{
                //   handle: '@handle',
                //   site: '@site',
                //   cardType: 'summary_large_image',
                // }}
              />
              <Component {...pageProps} />
              <NotificationList />
            </div>
          </WidthProvider>
        </SessionProvider>
      </WagmiConfig>
    </NotificationProvider>
  );
};

export default api.withTRPC(MyApp);
