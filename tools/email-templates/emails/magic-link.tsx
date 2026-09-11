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
              src="https://snacks.maciejg.dev/logo.png"
              alt="Snack Rate"
              width="90"
              height="auto"
            />
          </Section>

          <Heading className="text-[#1d1c1d] text-4xl font-bold my-7.5 mx-0 p-0 leading-10.5">
            Weryfikacja
          </Heading>

          <Text className="text-xl mb-7.5">
            Witamy w Snack Rate! Poniżej znajdziesz kod potwierdzający. Wpisz go w otwartym oknie
            przeglądarki, aby kontynuować logowanie.
          </Text>

          <Section className="bg-[rgb(245,244,245)] rounded mb-7.5 py-14 px-2.5">
            <Text className="text-3xl leading-6 text-center align-middle font-bold">
              {validationCode}
            </Text>
          </Section>

          <Text className="text-black text-sm leading-6">
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
  validationCode: "KEBAB",
} as MagicLinkProps;

export default MagicLink;
