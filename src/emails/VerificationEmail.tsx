import * as React from 'react';
import { Html, Body, Head, Container, Text, Hr, Img, Link, Button } from '@react-email/components';

interface VerificationEmailProps {
    verificationLink: string;
    email: string;
}

export const VerificationEmail = ({ verificationLink, email }: VerificationEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <div style={header}>
                        <Img src="https://krishnanaturals.co.in/images/logo.png" width="180" height="auto" alt="Krishna Naturals" style={logo} />
                    </div>

                    {/* Content */}
                    <div style={content}>
                        <Text style={subjectText}>Verify your email address</Text>
                        <Hr style={divider} />

                        <Text style={paragraph}>
                            Welcome to the Krishna Naturals family! We're thrilled to have you.
                        </Text>

                        <Text style={paragraph}>
                            Please verify your <strong>{email}</strong> email address so we know it's really you. Your journey to 100% pure, raw honey starts right here.
                        </Text>

                        <div style={btnContainer}>
                            <Button href={verificationLink} style={button}>
                                VERIFY EMAIL ADDRESS
                            </Button>
                        </div>

                        <Text style={paragraph}>
                            If the button doesn't work, copy and paste this link into your browser:
                            <br />
                            <Link href={verificationLink} style={urlText}>{verificationLink}</Link>
                        </Text>
                    </div>

                    {/* Footer */}
                    <div style={footer}>
                        <Text style={footerText}>
                            Sent with ❤️ from <strong>Krishna Naturals</strong>
                            <br />
                            Madhapar, Bhuj, Gujarat - 370020
                        </Text>
                        <Link href="https://krishnanaturals.co.in" style={footerLink}>
                            Visit our Shop
                        </Link>
                    </div>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#FDFAF3',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
    padding: '40px 0',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0',
    borderRadius: '12px',
    border: '1px solid #eaeaea',
    maxWidth: '500px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
};

const header = {
    backgroundColor: '#1A3A2A',
    padding: '30px 40px',
    textAlign: 'center' as const,
};

const logo = {
    margin: '0 auto',
    borderRadius: '8px',
};

const content = {
    padding: '40px',
};

const subjectText = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1A3A2A',
    textAlign: 'center' as const,
    margin: '0 0 20px',
    lineHeight: '1.3',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333333',
    marginBottom: '20px',
    textAlign: 'center' as const,
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '35px 0',
};

const button = {
    backgroundColor: '#C9A84C',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '15px',
    textDecoration: 'none',
    letterSpacing: '0.05em',
    display: 'inline-block',
};

const urlText = {
    fontSize: '12px',
    color: '#A8A29E',
    wordBreak: 'break-all' as const,
    marginTop: '10px',
};

const divider = {
    borderTop: '1px solid #eaeaea',
    margin: '20px 0',
};

const footer = {
    backgroundColor: '#FAFAF9',
    padding: '30px 40px',
    textAlign: 'center' as const,
    borderTop: '1px solid #eaeaea',
};

const footerText = {
    fontSize: '14px',
    color: '#78716C',
    lineHeight: '1.6',
    margin: '0 0 15px',
};

const footerLink = {
    color: '#C9A84C',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
};
