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

interface BookingConfirmationEmailProps {
  parentName: string;
  studentName: string;
  courseName: string;
  teacherName: string;
  startTime: string;
  durationMinutes: number;
}

export default function BookingConfirmationEmail({
  parentName,
  studentName,
  courseName,
  teacherName,
  startTime,
  durationMinutes,
}: BookingConfirmationEmailProps) {
  const dateStr = new Date(startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  const timeStr = new Date(startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <Html>
      <Head />
      <Preview>Your booking for {courseName} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Tiptop Academy</Heading>
          
          <Text style={text}>Hi {parentName},</Text>
          <Text style={text}>
            Your booking is officially confirmed! {studentName} is scheduled to join the live session for <strong>{courseName}</strong>.
          </Text>

          <Section style={detailsContainer}>
            <Text style={detailText}><strong>Class:</strong> {courseName}</Text>
            <Text style={detailText}><strong>Teacher:</strong> {teacherName}</Text>
            <Text style={detailText}><strong>Date:</strong> {dateStr}</Text>
            <Text style={detailText}><strong>Time:</strong> {timeStr} ({durationMinutes} mins)</Text>
          </Section>

          <Text style={text}>
            At the scheduled time, simply log into the Parent Dashboard and click &quot;Launch Portal&quot; on {studentName}&apos;s card to access the secure classroom.
          </Text>

          <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
            <Button href="https://tiptopacademy.com/parent/dashboard" style={button}>
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            Need help? Contact us at support@tiptopacademy.com.
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
