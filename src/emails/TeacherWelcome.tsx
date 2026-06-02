import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
  Preview
} from '@react-email/components';

interface TeacherWelcomeEmailProps {
  teacherName: string;
  email: string;
  temporaryPassword: string;
}

export default function TeacherWelcomeEmail({
  teacherName,
  email,
  temporaryPassword,
}: TeacherWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Tiptop Virtual Academy!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Tiptop Academy</Heading>
          
          <Text style={text}>Hi {teacherName},</Text>
          <Text style={text}>
            Welcome to the Tiptop Academy team! Your administrator has created your Teacher Portal account. 
            You can now log in and begin managing your classes, attendance, lesson plans, and student badges.
          </Text>

          <Section style={detailsContainer}>
            <Text style={detailText}><strong>Portal Login URL:</strong> <a href="https://tiptopacademy.com/login">tiptopacademy.com/login</a></Text>
            <Text style={detailText}><strong>Username/Email:</strong> {email}</Text>
            <Text style={detailText}><strong>Temporary Password:</strong> <code>{temporaryPassword}</code></Text>
          </Section>

          <Text style={{ ...text, color: '#ef4444', fontWeight: 'bold' }}>
            IMPORTANT: For security, please log in immediately using the temporary password above, and change it via your profile dashboard settings.
          </Text>

          <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
            <Button href="https://tiptopacademy.com/login" style={button}>
              Log Into Portal
            </Button>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            Need assistance setting up your courses or schedule? Contact admin at support@tiptopacademy.com.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  border: '1px solid #eaeaea',
  maxWidth: '600px',
};

const h1 = {
  color: '#e81cff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const detailsContainer = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const detailText = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '8px 0',
};

const button = {
  backgroundColor: '#e81cff',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
};
