import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Button,
  Hr,
} from "@react-email/components";

export const NewUserMagicLink = ({
  magicLink,
  name,
}: {
  magicLink: string;
  name: string;
}) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome! Confirm Your Email to Get Started</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Img
              src={`${process.env.NEXT_PUBLIC_SERVER_URL}/public/logo.png`}
              width="48"
              height="48"
              alt="Logo"
            />
            <Hr style={hr} />
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              Thank you for signing up for Acme! We&apos;re excited to have you
              on board.
            </Text>
            <Text style={paragraph}>
              To complete your registration, please confirm your email address
              by clicking the link below:
            </Text>
            <Button style={button} href={magicLink}>
              Confirm Your Email
            </Button>
            <Hr style={hr} />
            <Text style={paragraph}>
              This magic link will log you into your account automatically and
              will expire in 5 minutes.
            </Text>
            <Text style={paragraph}>
              If you didn&apos;t request this link, you can safely ignore this
              email.
            </Text>
            <Text style={paragraph}>
              Best,
              <br />- The Acme Team
            </Text>
            <Hr style={hr} />
            <Text style={footer}>Address Line</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const ExistingUserMagicLink = ({
  magicLink,
  name,
}: {
  magicLink: string;
  name: string;
}) => {
  return (
    <Html>
      <Head />
      <Preview>Access Your Account with This Magic Link</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Img
              src={`${process.env.NEXT_PUBLIC_SERVER_URL}/public/logo.png`}
              width="48"
              height="48"
              alt="Logo"
            />
            <Hr style={hr} />
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              We&apos;ve received a request to log into your Acme account.
            </Text>
            <Button style={button} href={magicLink}>
              Sign In to Your Account
            </Button>
            <Hr style={hr} />
            <Text style={paragraph}>
              This magic link will log you into your account automatically and
              will expire in 5 minutes.
            </Text>
            <Text style={paragraph}>
              If you didn&apos;t request this link, you can safely ignore this
              email.
            </Text>
            <Text style={paragraph}>
              Best,
              <br />- The Acme Team
            </Text>
            <Hr style={hr} />
            <Text style={footer}>Address Line</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",

  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const anchor = {
  color: "#556cd6",
};

const button = {
  backgroundColor: "#656ee8",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "10px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
