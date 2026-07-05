import * as React from 'react';
import { Html, Body, Head, Container, Text, Hr, Img, Link, Markdown } from '@react-email/components';

interface MarketingEmailProps {
    subject: string;
    markdownContent: string;
}

export const MarketingEmail = ({ subject, markdownContent }: MarketingEmailProps) => {
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
                        <Text style={subjectText}>{subject}</Text>
                        <Hr style={divider} />

                        <div style={markdownWrapper}>
                            <Markdown
                                markdownCustomStyles={{
                                    h1: { fontSize: '24px', color: '#1A3A2A', fontWeight: 'bold', marginTop: '30px', marginBottom: '15px' },
                                    h2: { fontSize: '20px', color: '#1A3A2A', fontWeight: 'bold', marginTop: '25px', marginBottom: '12px' },
                                    h3: { fontSize: '18px', color: '#1A3A2A', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' },
                                    p: { fontSize: '16px', lineHeight: '1.6', color: '#333333', marginBottom: '15px' },
                                    li: { fontSize: '16px', lineHeight: '1.6', color: '#333333', marginBottom: '8px' },
                                    link: { color: '#C9A84C', textDecoration: 'underline' },
                                }}
                            >
                                {markdownContent}
                            </Markdown>
                        </div>
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
    maxWidth: '600px',
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

const markdownWrapper = {
    marginTop: '20px',
};

const divider = {
    borderTop: '1px solid #eaeaea',
    margin: '20px 0 30px',
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
