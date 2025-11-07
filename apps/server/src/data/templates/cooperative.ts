/**
 * Cooperative Workflow Templates
 * Pre-built workflows for cooperatives and community organizations
 */

import { WorkflowTemplate, TemplateCategory, TemplateDifficulty, NodeType, WorkflowStatus } from '@taktak/types';

export const cooperativeTemplates: WorkflowTemplate[] = [
  // 1. Member Meeting Reminder
  {
    id: 'coop-meeting-reminder',
    name: 'Member Meeting Reminder',
    description: 'Send automated reminders to members about upcoming meetings',
    category: TemplateCategory.COOPERATIVE,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['meetings', 'reminders', 'members', 'sms'],
    icon: '📢',
    estimatedSetupTime: 10,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Increase meeting attendance',
      'Keep members informed',
      'Reduce no-shows',
      'Improve engagement',
    ],
    benefits: [
      'Higher meeting attendance',
      'Better member participation',
      'Saves time on manual reminders',
      'Improves communication',
    ],
    workflow: {
      type: 'workflow',
      name: 'Member Meeting Reminder',
      description: 'Send SMS reminders 2 days before meetings',
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
          name: 'Get Upcoming Meetings',
          config: {
            query: 'SELECT * FROM meetings WHERE meeting_date = DATE_ADD(CURDATE(), INTERVAL 2 DAY) AND status = "scheduled"',
            database: 'coop_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.CONDITION,
          name: 'Check if Meetings Exist',
          config: {
            condition: 'input.length > 0',
          },
        },
        {
          id: 'node-3',
          type: NodeType.LOOP,
          name: 'For Each Meeting',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-4',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Active Members',
          config: {
            query: 'SELECT * FROM members WHERE status = "active"',
            database: 'coop_db',
          },
        },
        {
          id: 'node-5',
          type: NodeType.LOOP,
          name: 'For Each Member',
          config: {
            items: '{{node-4.output}}',
          },
        },
        {
          id: 'node-6',
          type: NodeType.SEND_SMS,
          name: 'Send Meeting Reminder',
          config: {
            to: '{{item.phone}}',
            message: 'Hi {{item.name}}, reminder: {{meeting.title}} on {{meeting.meeting_date}} at {{meeting.time}}. Location: {{meeting.location}}. See you there! - {{coop_name}}',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3', condition: 'true' },
        { from: 'node-3', to: 'node-4' },
        { from: 'node-4', to: 'node-5' },
        { from: 'node-5', to: 'node-6' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 2. Contribution Reminder
  {
    id: 'coop-contribution-reminder',
    name: 'Monthly Contribution Reminder',
    description: 'Remind members about their monthly contributions',
    category: TemplateCategory.COOPERATIVE,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['contributions', 'payments', 'reminders', 'sms'],
    icon: '💰',
    estimatedSetupTime: 15,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Improve payment collection',
      'Reduce late payments',
      'Maintain cash flow',
      'Automate reminders',
    ],
    benefits: [
      'Increases on-time payments',
      'Reduces administrative work',
      'Improves financial stability',
      'Better member compliance',
    ],
    workflow: {
      type: 'workflow',
      name: 'Monthly Contribution Reminder',
      description: 'Send reminders on the 1st of each month',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Daily Schedule',
        type: NodeType.SCHEDULE,
        config: {
          cron: '0 8 1 * *', // Run on 1st of each month at 8 AM
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Active Members',
          config: {
            query: 'SELECT * FROM members WHERE status = "active"',
            database: 'coop_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.LOOP,
          name: 'For Each Member',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.DATABASE_QUERY,
          name: 'Check Payment Status',
          config: {
            query: 'SELECT * FROM contributions WHERE member_id = {{item.id}} AND month = MONTH(CURDATE()) AND year = YEAR(CURDATE())',
            database: 'coop_db',
          },
        },
        {
          id: 'node-4',
          type: NodeType.CONDITION,
          name: 'Check if Not Paid',
          config: {
            condition: 'node-3.output.length === 0',
          },
        },
        {
          id: 'node-5',
          type: NodeType.SEND_SMS,
          name: 'Send Payment Reminder',
          config: {
            to: '{{item.phone}}',
            message: 'Hi {{item.name}}, this is a reminder that your monthly contribution of ${{item.contribution_amount}} is due. Please pay by {{payment_deadline}}. Thank you! - {{coop_name}}',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
        { from: 'node-3', to: 'node-4' },
        { from: 'node-4', to: 'node-5', condition: 'true' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 3. New Member Welcome
  {
    id: 'coop-new-member-welcome',
    name: 'New Member Welcome',
    description: 'Send welcome message and onboarding info to new members',
    category: TemplateCategory.COOPERATIVE,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['onboarding', 'welcome', 'members', 'email'],
    icon: '👋',
    estimatedSetupTime: 15,
    requiredIntegrations: ['smtp', 'database'],
    useCases: [
      'Welcome new members',
      'Provide onboarding info',
      'Build engagement',
      'Set expectations',
    ],
    benefits: [
      'Better first impression',
      'Faster member integration',
      'Reduces onboarding questions',
      'Increases member retention',
    ],
    workflow: {
      type: 'workflow',
      name: 'New Member Welcome',
      description: 'Send welcome email when new member joins',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Database Watch',
        type: NodeType.DATABASE_WATCH,
        config: {
          table: 'members',
          event: 'insert',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.SEND_EMAIL,
          name: 'Send Welcome Email',
          config: {
            to: '{{trigger.email}}',
            subject: 'Welcome to {{coop_name}}! 🎉',
            body: 'Hi {{trigger.name}},\n\nWelcome to {{coop_name}}! We\'re thrilled to have you as a member.\n\nHere\'s what you need to know:\n\n📅 Next Meeting: {{next_meeting_date}} at {{next_meeting_time}}\n💰 Monthly Contribution: ${{trigger.contribution_amount}} due on the 1st\n📍 Location: {{coop_address}}\n📞 Contact: {{coop_phone}}\n\nGetting Started:\n1. Attend your first meeting to meet other members\n2. Set up your monthly contribution payment\n3. Join our WhatsApp group: {{whatsapp_link}}\n4. Review our bylaws: {{bylaws_link}}\n\nBenefits:\n- Access to cooperative resources\n- Voting rights in decisions\n- Profit sharing\n- Community support\n\nQuestions? Reply to this email or call us at {{coop_phone}}.\n\nWe look forward to working with you!\n\nBest regards,\n{{coop_name}} Team',
          },
        },
        {
          id: 'node-2',
          type: NodeType.DELAY,
          name: 'Wait 3 Days',
          config: {
            duration: 259200, // 3 days in seconds
          },
        },
        {
          id: 'node-3',
          type: NodeType.SEND_SMS,
          name: 'Send Follow-up SMS',
          config: {
            to: '{{trigger.phone}}',
            message: 'Hi {{trigger.name}}! How are you settling in? Don\'t forget our next meeting on {{next_meeting_date}}. Any questions? Call us at {{coop_phone}}. - {{coop_name}}',
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

  // 4. Dividend Distribution Notification
  {
    id: 'coop-dividend-notification',
    name: 'Dividend Distribution Notification',
    description: 'Notify members when dividends are ready for distribution',
    category: TemplateCategory.COOPERATIVE,
    difficulty: TemplateDifficulty.INTERMEDIATE,
    tags: ['dividends', 'profits', 'notifications', 'email'],
    icon: '💵',
    estimatedSetupTime: 20,
    requiredIntegrations: ['smtp', 'database'],
    useCases: [
      'Announce profit sharing',
      'Inform members of dividends',
      'Build transparency',
      'Increase satisfaction',
    ],
    benefits: [
      'Transparent communication',
      'Increases member satisfaction',
      'Builds trust',
      'Professional image',
    ],
    workflow: {
      type: 'workflow',
      name: 'Dividend Distribution Notification',
      description: 'Notify members when dividends are calculated',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Webhook Trigger',
        type: NodeType.WEBHOOK,
        config: {
          path: '/dividends/notify',
          method: 'POST',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Member Dividends',
          config: {
            query: 'SELECT m.*, d.amount, d.year FROM members m JOIN dividends d ON m.id = d.member_id WHERE d.year = {{trigger.year}} AND d.status = "approved"',
            database: 'coop_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.LOOP,
          name: 'For Each Member',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.SEND_EMAIL,
          name: 'Send Dividend Notification',
          config: {
            to: '{{item.email}}',
            subject: '{{coop_name}} - Your {{item.year}} Dividend is Ready! 💰',
            body: 'Hi {{item.name}},\n\nGreat news! Your dividend for {{item.year}} has been calculated and approved.\n\nDividend Amount: ${{item.amount}}\n\nThis dividend is based on:\n- Your patronage during {{item.year}}\n- Your contribution to the cooperative\n- Overall cooperative performance\n\nPayment Details:\n- Payment Method: {{payment_method}}\n- Expected Payment Date: {{payment_date}}\n- Tax Information: {{tax_info}}\n\nThank you for being a valued member of {{coop_name}}. Your participation and support make our cooperative successful!\n\nQuestions? Contact us at {{coop_phone}} or reply to this email.\n\nBest regards,\n{{coop_name}} Board',
          },
        },
        {
          id: 'node-4',
          type: NodeType.DATABASE_UPDATE,
          name: 'Mark Notification Sent',
          config: {
            query: 'UPDATE dividends SET notification_sent = 1, notification_date = NOW() WHERE member_id = {{item.id}} AND year = {{item.year}}',
            database: 'coop_db',
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
];

