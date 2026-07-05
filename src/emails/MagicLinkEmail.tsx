import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
} from "@react-email/components";
import * as React from "react";

interface MagicLinkEmailProps {
    loginLink: string;
}

export const MagicLinkEmail = ({
    loginLink = "https://krishnanaturals.co.in/auth/verify",
}: MagicLinkEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your secure Magic Login Link from Krishna Naturals</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Text style={logoText}>🍯 Krishna Naturals</Text>
                    </Section>

                    {/* Body */}
                    <Section style={content}>
                        <Heading style={h1}>Sign in to your account</Heading>
                        <Text style={text}>
                            We received a request to securely log you into your Krishna Naturals account using a passwordless Magic Link.
                        </Text>
                        <Text style={text}>
                            Please click the button below to instantly sign in to your dashboard without needing a password.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={button} href={loginLink}>
                                Securely Log In Now
                            </Button>
                        </Section>

                        <Text style={text}>
                            If you did not request this email, you can safely ignore it. This link is only valid for 1 hour.
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} Krishna Naturals. All rights reserved.
                        </Text>
                        <Text style={footerText}>Gujarat, India</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default MagicLinkEmail;

// --- Styles ---
const main = {
    backgroundColor: "#FFF8E7", // Cream
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "100%",
    maxWidth: "600px",
};

const header = {
    padding: "32px 20px",
    textAlign: "center" as const,
    backgroundColor: "#1B4332", // Forest Green
    borderRadius: "12px 12px 0 0",
};

const logoText = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#D4A843", // Gold
    margin: "0",
    fontFamily: "Georgia, serif",
};

const content = {
    padding: "32px 32px 40px",
    backgroundColor: "#ffffff",
    border: "1px solid #eaeaea",
    borderTop: "none",
    borderRadius: "0 0 12px 12px",
};

const h1 = {
    color: "#1B4332",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "32px",
    margin: "0 0 20px",
    fontFamily: "Georgia, serif",
};

const text = {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 20px",
};

const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#D4A843", // Gold
    borderRadius: "8px",
    color: "#1B4332",
    fontWeight: "600",
    fontSize: "15px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 28px",
};

const footer = {
    padding: "32px 20px",
    textAlign: "center" as const,
};

const footerText = {
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "16px",
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
};
