import * as React from "react";
import {
  Body,
  Container,
  Font,
  Head,
  pixelBasedPreset,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
} from "react-email";

interface MagicLinkProps {
  email?: string;
  validationCode?: string;
}

type MagicLinkComponent = {
  (props: MagicLinkProps): React.JSX.Element;
  PreviewProps?: MagicLinkProps;
};

export const MagicLink: MagicLinkComponent = ({ validationCode }) => (
  <Html lang="pl">
    <Head>
      <Font
        fontFamily="Nunito Sans"
        fallbackFontFamily="Verdana"
        webFont={{
          url: "https://fonts.gstatic.com/s/nunitosans/v19/pe0AMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfUVwoNnq4CLz0_kJPxzGOF.woff2",
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>

    <Preview>Potwierdź swój adres e-mail</Preview>

    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: "#007291",
            },
          },
        },
      }}
    >
      <Body className="bg-white mx-auto my-0">
        <Container className="mx-auto my-0 py-0 px-5">
          <Section className="mt-8 mb-8 text-center">
            <Img
              src="https://snacks.maciejg.dev/logo-small.png"
              alt="Snack Rate"
              width="80"
              height="auto"
            />
          </Section>

          <Heading className="text-[#1d1c1d] text-2xl font-bold my-4 mx-0 p-0 leading-10.5">
            Witamy w Snack Rate!
          </Heading>

          <Text className="text-sm mb-5 text-gray-600">
            Otrzymaliśmy prośbę o zalogowanie się na Twoje konto.
          </Text>

          <Text className="text-sm mb-7.5 text-gray-600">
            Wprowadź poniższy kod weryfikacyjny w oknie logowania.
          </Text>

          <Section className="rounded mb-7.5 px-2.5">
            <Text className="text-3xl tracking-[12px] leading-6 text-center align-middle font-bold bg-[rgb(245,244,245)] rounded-xl border border-black/5 w-fit px-10 py-8 mx-auto">
              {validationCode}
            </Text>

            <Text className="text-xs mx-auto text-center text-gray-600 mb-7.5">
              Kod jest ważny przez <span className="font-bold">15 minut</span>.
            </Text>
          </Section>

          <Hr />

          <Text className="text-gray-600 text-xs leading-6">
            Jeśli to nie Ty próbujesz się zalogować, nie musisz nic robić. Możesz bezpiecznie
            zignorować tę wiadomość.
          </Text>

          <Text className="text-xs leading-3.75 text-left mb-12.5 text-[#b7b7b7]">
            ©2026 Snack Rate. Wszelkie prawa zastrzeżone.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

MagicLink.PreviewProps = {
  validationCode: "QZ73FX",
} as MagicLinkProps;

export default MagicLink;
