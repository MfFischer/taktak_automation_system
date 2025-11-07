/**
 * Clinic Workflow Templates
 * Pre-built workflows for healthcare clinics
 */

import { WorkflowTemplate, TemplateCategory, TemplateDifficulty, NodeType, WorkflowStatus } from '@taktak/types';

export const clinicTemplates: WorkflowTemplate[] = [
  // 1. Appointment Reminder
  {
    id: 'clinic-appointment-reminder',
    name: 'Appointment Reminder System',
    description: 'Automatically send SMS reminders to patients 24 hours before their scheduled appointments',
    category: TemplateCategory.CLINIC,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['appointments', 'reminders', 'sms', 'patient-care'],
    icon: '📅',
    estimatedSetupTime: 10,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Reduce no-show rates',
      'Improve patient attendance',
      'Automate appointment reminders',
      'Free up staff time',
    ],
    benefits: [
      'Reduces no-shows by up to 30%',
      'Saves staff time on manual calls',
      'Improves patient satisfaction',
      'Easy to customize message templates',
    ],
    workflow: {
      type: 'workflow',
      name: 'Appointment Reminder System',
      description: 'Send SMS reminders 24 hours before appointments',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Daily Schedule',
        type: NodeType.SCHEDULE,
        config: {
          cron: '0 9 * * *', // Run daily at 9 AM
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Tomorrow\'s Appointments',
          config: {
            query: 'SELECT * FROM appointments WHERE date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND status = "confirmed"',
            database: 'clinic_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.CONDITION,
          name: 'Check if Appointments Exist',
          config: {
            condition: 'input.length > 0',
          },
        },
        {
          id: 'node-3',
          type: NodeType.LOOP,
          name: 'For Each Appointment',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-4',
          type: NodeType.SEND_SMS,
          name: 'Send Reminder SMS',
          config: {
            to: '{{item.patient_phone}}',
            message: 'Hi {{item.patient_name}}, this is a reminder about your appointment tomorrow at {{item.time}} with Dr. {{item.doctor_name}}. Reply CONFIRM to confirm or CANCEL to reschedule.',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3', condition: 'true' },
        { from: 'node-3', to: 'node-4' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 2. Prescription Refill Reminder
  {
    id: 'clinic-prescription-refill',
    name: 'Prescription Refill Reminder',
    description: 'Notify patients when their prescriptions are due for refill',
    category: TemplateCategory.CLINIC,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['prescriptions', 'reminders', 'medication', 'patient-care'],
    icon: '💊',
    estimatedSetupTime: 15,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Improve medication adherence',
      'Reduce gaps in treatment',
      'Proactive patient care',
      'Increase pharmacy revenue',
    ],
    benefits: [
      'Improves patient health outcomes',
      'Increases prescription refill rates',
      'Reduces emergency visits',
      'Builds patient loyalty',
    ],
    workflow: {
      type: 'workflow',
      name: 'Prescription Refill Reminder',
      description: 'Send reminders 3 days before prescription expires',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Daily Schedule',
        type: NodeType.SCHEDULE,
        config: {
          cron: '0 10 * * *', // Run daily at 10 AM
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Expiring Prescriptions',
          config: {
            query: 'SELECT * FROM prescriptions WHERE expiry_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY) AND status = "active"',
            database: 'clinic_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.LOOP,
          name: 'For Each Prescription',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.SEND_SMS,
          name: 'Send Refill Reminder',
          config: {
            to: '{{item.patient_phone}}',
            message: 'Hi {{item.patient_name}}, your prescription for {{item.medication_name}} expires in 3 days. Reply REFILL to request a refill or call us at {{clinic_phone}}.',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 3. Lab Results Notification
  {
    id: 'clinic-lab-results',
    name: 'Lab Results Notification',
    description: 'Automatically notify patients when their lab results are ready',
    category: TemplateCategory.CLINIC,
    difficulty: TemplateDifficulty.INTERMEDIATE,
    tags: ['lab-results', 'notifications', 'patient-portal', 'email'],
    icon: '🔬',
    estimatedSetupTime: 20,
    requiredIntegrations: ['smtp', 'database'],
    useCases: [
      'Faster result delivery',
      'Reduce phone call volume',
      'Improve patient experience',
      'HIPAA-compliant notifications',
    ],
    benefits: [
      'Patients get results faster',
      'Reduces staff workload',
      'Secure and compliant',
      'Improves patient satisfaction',
    ],
    workflow: {
      type: 'workflow',
      name: 'Lab Results Notification',
      description: 'Email patients when lab results are available',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Database Watch',
        type: NodeType.DATABASE_WATCH,
        config: {
          table: 'lab_results',
          event: 'insert',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Patient Info',
          config: {
            query: 'SELECT * FROM patients WHERE id = {{trigger.patient_id}}',
            database: 'clinic_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.SEND_EMAIL,
          name: 'Send Results Notification',
          config: {
            to: '{{node-1.output.email}}',
            subject: 'Your Lab Results Are Ready',
            body: 'Hi {{node-1.output.name}},\n\nYour lab results from {{trigger.test_date}} are now available in your patient portal.\n\nTest: {{trigger.test_name}}\nStatus: {{trigger.status}}\n\nPlease log in to your patient portal to view your complete results, or call us at {{clinic_phone}} if you have any questions.\n\nBest regards,\n{{clinic_name}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.CONDITION,
          name: 'Check if Abnormal',
          config: {
            condition: 'trigger.status === "abnormal"',
          },
        },
        {
          id: 'node-4',
          type: NodeType.SEND_SMS,
          name: 'Send Urgent SMS',
          config: {
            to: '{{node-1.output.phone}}',
            message: 'URGENT: Your lab results require attention. Please call us at {{clinic_phone}} as soon as possible.',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
        { from: 'node-3', to: 'node-4', condition: 'true' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 4. Patient Follow-up
  {
    id: 'clinic-patient-followup',
    name: 'Post-Visit Follow-up',
    description: 'Send follow-up messages to patients after their visit',
    category: TemplateCategory.CLINIC,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['follow-up', 'patient-care', 'feedback', 'sms'],
    icon: '🩺',
    estimatedSetupTime: 10,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Improve patient care',
      'Collect feedback',
      'Ensure treatment compliance',
      'Build patient relationships',
    ],
    benefits: [
      'Shows patients you care',
      'Catches issues early',
      'Improves patient outcomes',
      'Increases patient retention',
    ],
    workflow: {
      type: 'workflow',
      name: 'Post-Visit Follow-up',
      description: 'Send follow-up SMS 2 days after visit',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Daily Schedule',
        type: NodeType.SCHEDULE,
        config: {
          cron: '0 14 * * *', // Run daily at 2 PM
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Recent Visits',
          config: {
            query: 'SELECT * FROM visits WHERE visit_date = DATE_SUB(CURDATE(), INTERVAL 2 DAY) AND followup_sent = 0',
            database: 'clinic_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.LOOP,
          name: 'For Each Visit',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.SEND_SMS,
          name: 'Send Follow-up SMS',
          config: {
            to: '{{item.patient_phone}}',
            message: 'Hi {{item.patient_name}}, we hope you\'re feeling better! How are you doing after your visit with Dr. {{item.doctor_name}}? Reply with any concerns or questions.',
          },
        },
        {
          id: 'node-4',
          type: NodeType.DATABASE_UPDATE,
          name: 'Mark Follow-up Sent',
          config: {
            query: 'UPDATE visits SET followup_sent = 1 WHERE id = {{item.id}}',
            database: 'clinic_db',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
        { from: 'node-3', to: 'node-4' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 5. Vaccination Reminder
  {
    id: 'clinic-vaccination-reminder',
    name: 'Vaccination Reminder System',
    description: 'Send automated reminders to parents for children\'s vaccination schedules',
    category: TemplateCategory.CLINIC,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['vaccination', 'immunization', 'pediatrics', 'reminders', 'sms'],
    icon: '💉',
    estimatedSetupTime: 15,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Improve vaccination compliance',
      'Reduce missed appointments',
      'Public health tracking',
      'Pediatric care automation',
    ],
    benefits: [
      'Increases vaccination rates',
      'Prevents disease outbreaks',
      'Reduces manual tracking',
      'Improves child health outcomes',
    ],
    workflow: {
      type: 'workflow',
      name: 'Vaccination Reminder System',
      description: 'Send reminders 1 week before vaccination due date',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Daily Schedule',
        type: NodeType.SCHEDULE,
        config: {
          cron: '0 9 * * *', // Run daily at 9 AM
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Upcoming Vaccinations',
          config: {
            query: 'SELECT v.*, p.name as patient_name, p.parent_phone FROM vaccinations v JOIN patients p ON v.patient_id = p.id WHERE v.due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND v.status = "pending"',
            database: 'clinic_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.LOOP,
          name: 'For Each Vaccination',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.SEND_SMS,
          name: 'Send Vaccination Reminder',
          config: {
            to: '{{item.parent_phone}}',
            message: 'Hi! Reminder: {{item.patient_name}} is due for {{item.vaccine_name}} vaccination on {{item.due_date}}. Please schedule an appointment. Reply BOOK to schedule. - {{clinic_name}}',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 6. Emergency Contact Alert
  {
    id: 'clinic-emergency-alert',
    name: 'Emergency Contact Alert System',
    description: 'Instantly notify emergency contacts when patient is admitted',
    category: TemplateCategory.CLINIC,
    difficulty: TemplateDifficulty.INTERMEDIATE,
    tags: ['emergency', 'alerts', 'critical-care', 'sms', 'notifications'],
    icon: '🚨',
    estimatedSetupTime: 20,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Emergency patient admissions',
      'Critical condition alerts',
      'Family notifications',
      'Compliance with protocols',
    ],
    benefits: [
      'Faster family notification',
      'Reduces staff workload',
      'Improves patient care',
      'Legal compliance',
    ],
    workflow: {
      type: 'workflow',
      name: 'Emergency Contact Alert System',
      description: 'Alert emergency contacts when patient is admitted',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Database Watch',
        type: NodeType.DATABASE_WATCH,
        config: {
          table: 'admissions',
          event: 'insert',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.CONDITION,
          name: 'Check if Emergency',
          config: {
            condition: 'trigger.admission_type === "emergency"',
          },
        },
        {
          id: 'node-2',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Patient & Emergency Contacts',
          config: {
            query: 'SELECT p.*, ec.name as contact_name, ec.phone as contact_phone, ec.relationship FROM patients p JOIN emergency_contacts ec ON p.id = ec.patient_id WHERE p.id = {{trigger.patient_id}}',
            database: 'clinic_db',
          },
        },
        {
          id: 'node-3',
          type: NodeType.LOOP,
          name: 'For Each Emergency Contact',
          config: {
            items: '{{node-2.output}}',
          },
        },
        {
          id: 'node-4',
          type: NodeType.SEND_SMS,
          name: 'Send Emergency Alert',
          config: {
            to: '{{item.contact_phone}}',
            message: 'URGENT: {{item.name}} has been admitted to {{clinic_name}} for emergency care. Please contact us at {{clinic_phone}} immediately. - {{clinic_name}} Emergency Dept',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2', condition: 'true' },
        { from: 'node-2', to: 'node-3' },
        { from: 'node-3', to: 'node-4' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

