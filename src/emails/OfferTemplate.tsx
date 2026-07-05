import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
  } from "@react-email/components";
  import * as React from "react";
  
  interface OfferTemplateProps {
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    discountCode?: string;
    trackingId?: string; // For Phase 10 Email Analytics Open Pixel
  }
  
  export const OfferTemplate = ({
    title = "Exclusive Offer from Krishna Naturals!",
    description = "We have a special treat just for you. Shop our 100% pure, raw forest honey and enjoy the purest taste of nature.",
    ctaText = "Shop Now",
    ctaLink = "https://krishnanaturals.co.in",
    discountCode = "SWEET10",
    trackingId = "",
  }: OfferTemplateProps) => {
    
    // The tracking pixel URL (Phase 10)
    const trackingPixelUrl = trackingId 
        ? `https://krishnanaturals.co.in/api/track/email/open?id=${trackingId}`
        : null;
        
    return (
      <Html>
        <Head />
        <Preview>{title}</Preview>
        <Body style={main}>
          <Container style={container}>
            <Section style={logoContainer}>
              <Img
                src="https://krishnanaturals.co.in/images/logo.png"
                width="120"
                height="120"
                alt="Krishna Naturals Logo"
                style={logo}
              />
            </Section>
            <Section style={content}>
              <Heading style={heading}>{title}</Heading>
              
              <Text style={paragraph}>
                {description}
              </Text>
  
              {discountCode && (
                <Section style={discountContainer}>
                  <Text style={discountLabel}>USE CODE AT CHECKOUT:</Text>
                  <Text style={discountCodeStyle}>{discountCode}</Text>
                </Section>
              )}
  
              <Section style={buttonContainer}>
                <Button style={button} href={ctaLink}>
                  {ctaText}
                </Button>
              </Section>
  
              <Hr style={hr} />
              
              <Text style={footer}>
                Stay pure, stay healthy.<br />
                <strong>Krishna Naturals Team</strong><br/>
                <Link href="https://krishnanaturals.co.in" style={link}>krishnanaturals.co.in</Link>
              </Text>
            </Section>
          </Container>
          
          {/* Email Analytics Tracking Pixel */}
          {trackingPixelUrl && (
            <Img
              src={trackingPixelUrl}
              width="1"
              height="1"
              alt=""
              style={{ display: "none" }}
            />
          )}
        </Body>
      </Html>
    );
  };
  
  export default OfferTemplate;
  
  const main = {
    backgroundColor: "#F9F6F0",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
    margin: "40px auto",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
    overflow: "hidden",
    maxWidth: "600px",
  };
  
  const logoContainer = {
    backgroundColor: "#1B4332",
    padding: "30px 20px",
    textAlign: "center" as const,
  };
  
  const logo = {
    margin: "0 auto",
  };
  
  const content = {
    padding: "40px",
  };
  
  const heading = {
    fontSize: "26px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#1B4332",
    margin: "0 0 20px",
    textAlign: "center" as const,
  };
  
  const paragraph = {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4B5563",
    margin: "0 0 24px",
    textAlign: "center" as const,
  };
  
  const discountContainer = {
    backgroundColor: "#FEF9C3", // gold-100
    borderRadius: "12px",
    padding: "20px",
    margin: "0 0 30px",
    textAlign: "center" as const,
    border: "1px dashed #D4A843",
  };
  
  const discountLabel = {
    fontSize: "12px",
    color: "#854D0E", // gold-800
    margin: "0 0 8px",
    letterSpacing: "1px",
    fontWeight: "600",
  };
  
  const discountCodeStyle = {
    fontSize: "24px",
    fontWeight: "800",
    color: "#1B4332",
    margin: "0",
    letterSpacing: "2px",
  };
  
  const buttonContainer = {
    textAlign: "center" as const,
    margin: "0 0 30px",
  };
  
  const button = {
    backgroundColor: "#D4A843",
    borderRadius: "8px",
    color: "#1B4332",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 32px",
  };
  
  const hr = {
    borderColor: "#E5E7EB",
    margin: "30px 0",
  };
  
  const footer = {
    fontSize: "14px",
    color: "#9CA3AF",
    textAlign: "center" as const,
    lineHeight: "1.6",
  };
  
  const link = {
    color: "#D4A843",
    textDecoration: "underline",
  };
