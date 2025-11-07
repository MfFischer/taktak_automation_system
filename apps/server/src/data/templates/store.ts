/**
 * Store Workflow Templates
 * Pre-built workflows for retail stores
 */

import { WorkflowTemplate, TemplateCategory, TemplateDifficulty, NodeType, WorkflowStatus } from '@taktak/types';

export const storeTemplates: WorkflowTemplate[] = [
  // 1. Low Inventory Alert
  {
    id: 'store-low-inventory-alert',
    name: 'Low Inventory Alert System',
    description: 'Automatically alert staff when product inventory falls below threshold',
    category: TemplateCategory.STORE,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['inventory', 'alerts', 'stock-management', 'sms'],
    icon: '📦',
    estimatedSetupTime: 10,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Prevent stockouts',
      'Automate reordering',
      'Optimize inventory levels',
      'Reduce lost sales',
    ],
    benefits: [
      'Never run out of popular items',
      'Reduces manual inventory checks',
      'Improves cash flow',
      'Increases sales',
    ],
    workflow: {
      type: 'workflow',
      name: 'Low Inventory Alert System',
      description: 'Check inventory levels and alert when low',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Daily Schedule',
        type: NodeType.SCHEDULE,
        config: {
          cron: '0 8,16 * * *', // Run twice daily at 8 AM and 4 PM
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Check Low Stock Items',
          config: {
            query: 'SELECT * FROM products WHERE quantity <= reorder_point AND active = 1',
            database: 'store_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.CONDITION,
          name: 'Check if Low Stock Exists',
          config: {
            condition: 'input.length > 0',
          },
        },
        {
          id: 'node-3',
          type: NodeType.TRANSFORM,
          name: 'Format Alert Message',
          config: {
            script: `
              const items = input.map(item => 
                \`- \${item.name}: \${item.quantity} left (reorder at \${item.reorder_point})\`
              ).join('\\n');
              return \`LOW STOCK ALERT:\\n\${items}\`;
            `,
          },
        },
        {
          id: 'node-4',
          type: NodeType.SEND_SMS,
          name: 'Alert Store Manager',
          config: {
            to: '{{manager_phone}}',
            message: '{{node-3.output}}',
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

  // 2. Order Confirmation
  {
    id: 'store-order-confirmation',
    name: 'Order Confirmation System',
    description: 'Send order confirmation emails to customers automatically',
    category: TemplateCategory.STORE,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['orders', 'confirmation', 'email', 'customer-service'],
    icon: '✅',
    estimatedSetupTime: 15,
    requiredIntegrations: ['smtp', 'database'],
    useCases: [
      'Improve customer experience',
      'Reduce order inquiries',
      'Build trust',
      'Professional communication',
    ],
    benefits: [
      'Customers feel confident',
      'Reduces support tickets',
      'Increases repeat purchases',
      'Professional brand image',
    ],
    workflow: {
      type: 'workflow',
      name: 'Order Confirmation System',
      description: 'Send confirmation email when order is placed',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Database Watch',
        type: NodeType.DATABASE_WATCH,
        config: {
          table: 'orders',
          event: 'insert',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Order Details',
          config: {
            query: 'SELECT o.*, c.name, c.email FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = {{trigger.id}}',
            database: 'store_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Order Items',
          config: {
            query: 'SELECT oi.*, p.name, p.price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = {{trigger.id}}',
            database: 'store_db',
          },
        },
        {
          id: 'node-3',
          type: NodeType.TRANSFORM,
          name: 'Format Order Summary',
          config: {
            script: `
              const items = node2.map(item => 
                \`\${item.quantity}x \${item.name} - $\${(item.price * item.quantity).toFixed(2)}\`
              ).join('\\n');
              return items;
            `,
          },
        },
        {
          id: 'node-4',
          type: NodeType.SEND_EMAIL,
          name: 'Send Confirmation Email',
          config: {
            to: '{{node-1.output.email}}',
            subject: 'Order Confirmation #{{node-1.output.order_number}}',
            body: 'Hi {{node-1.output.name}},\n\nThank you for your order! We\'ve received your order and are processing it now.\n\nOrder #{{node-1.output.order_number}}\nDate: {{node-1.output.created_at}}\n\nItems:\n{{node-3.output}}\n\nSubtotal: ${{node-1.output.subtotal}}\nTax: ${{node-1.output.tax}}\nTotal: ${{node-1.output.total}}\n\nDelivery Address:\n{{node-1.output.delivery_address}}\n\nWe\'ll send you another email when your order ships.\n\nThank you for shopping with us!\n{{store_name}}',
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

  // 3. Customer Feedback Request
  {
    id: 'store-feedback-request',
    name: 'Customer Feedback Request',
    description: 'Request feedback from customers after purchase',
    category: TemplateCategory.STORE,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['feedback', 'reviews', 'customer-satisfaction', 'sms'],
    icon: '⭐',
    estimatedSetupTime: 10,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Collect customer reviews',
      'Improve products/services',
      'Build social proof',
      'Identify issues early',
    ],
    benefits: [
      'Increases positive reviews',
      'Improves customer satisfaction',
      'Identifies problems quickly',
      'Builds trust with new customers',
    ],
    workflow: {
      type: 'workflow',
      name: 'Customer Feedback Request',
      description: 'Send feedback request 3 days after delivery',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Daily Schedule',
        type: NodeType.SCHEDULE,
        config: {
          cron: '0 11 * * *', // Run daily at 11 AM
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Delivered Orders',
          config: {
            query: 'SELECT o.*, c.name, c.phone FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.delivered_date = DATE_SUB(CURDATE(), INTERVAL 3 DAY) AND o.feedback_requested = 0',
            database: 'store_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.LOOP,
          name: 'For Each Order',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.SEND_SMS,
          name: 'Send Feedback Request',
          config: {
            to: '{{item.phone}}',
            message: 'Hi {{item.name}}! How was your recent order #{{item.order_number}}? We\'d love your feedback! Rate us 1-5 stars by replying with a number. Thank you! - {{store_name}}',
          },
        },
        {
          id: 'node-4',
          type: NodeType.DATABASE_UPDATE,
          name: 'Mark Feedback Requested',
          config: {
            query: 'UPDATE orders SET feedback_requested = 1 WHERE id = {{item.id}}',
            database: 'store_db',
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

  // 4. Abandoned Cart Recovery
  {
    id: 'store-abandoned-cart',
    name: 'Abandoned Cart Recovery',
    description: 'Send reminders to customers who left items in their cart',
    category: TemplateCategory.STORE,
    difficulty: TemplateDifficulty.INTERMEDIATE,
    tags: ['cart', 'recovery', 'sales', 'email'],
    icon: '🛒',
    estimatedSetupTime: 20,
    requiredIntegrations: ['smtp', 'database'],
    useCases: [
      'Recover lost sales',
      'Increase conversion rate',
      'Re-engage customers',
      'Boost revenue',
    ],
    benefits: [
      'Recovers 10-15% of abandoned carts',
      'Increases revenue without ads',
      'Improves customer lifetime value',
      'Easy to implement',
    ],
    workflow: {
      type: 'workflow',
      name: 'Abandoned Cart Recovery',
      description: 'Send reminder email for carts abandoned 24 hours ago',
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
          name: 'Get Abandoned Carts',
          config: {
            query: 'SELECT c.*, cu.name, cu.email FROM carts c JOIN customers cu ON c.customer_id = cu.id WHERE c.updated_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND c.status = "active" AND c.reminder_sent = 0',
            database: 'store_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.LOOP,
          name: 'For Each Cart',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Cart Items',
          config: {
            query: 'SELECT ci.*, p.name, p.price, p.image_url FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = {{item.id}}',
            database: 'store_db',
          },
        },
        {
          id: 'node-4',
          type: NodeType.SEND_EMAIL,
          name: 'Send Recovery Email',
          config: {
            to: '{{item.email}}',
            subject: 'You left something behind! 🛒',
            body: 'Hi {{item.name}},\n\nWe noticed you left some items in your cart. Don\'t worry, we saved them for you!\n\nYour cart contains:\n{{node-3.output}}\n\nTotal: ${{item.total}}\n\nComplete your purchase now and get FREE shipping on orders over $50!\n\n[Complete Your Order]\n\nQuestions? Reply to this email or call us at {{store_phone}}.\n\nHappy shopping!\n{{store_name}}',
          },
        },
        {
          id: 'node-5',
          type: NodeType.DATABASE_UPDATE,
          name: 'Mark Reminder Sent',
          config: {
            query: 'UPDATE carts SET reminder_sent = 1 WHERE id = {{item.id}}',
            database: 'store_db',
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
        { from: 'node-3', to: 'node-4' },
        { from: 'node-4', to: 'node-5' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 5. Birthday Discount Campaign
  {
    id: 'store-birthday-discount',
    name: 'Birthday Discount Campaign',
    description: 'Send personalized birthday discounts to customers automatically',
    category: TemplateCategory.STORE,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['marketing', 'discounts', 'birthdays', 'customer-loyalty', 'sms'],
    icon: '🎂',
    estimatedSetupTime: 15,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Increase customer loyalty',
      'Drive repeat purchases',
      'Personalized marketing',
      'Build customer relationships',
    ],
    benefits: [
      'Increases customer lifetime value',
      'Drives birthday month sales',
      'Improves brand perception',
      'Easy to automate',
    ],
    workflow: {
      type: 'workflow',
      name: 'Birthday Discount Campaign',
      description: 'Send birthday discount SMS to customers',
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
          name: 'Get Today\'s Birthdays',
          config: {
            query: 'SELECT * FROM customers WHERE MONTH(birthday) = MONTH(CURDATE()) AND DAY(birthday) = DAY(CURDATE()) AND active = 1',
            database: 'store_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.LOOP,
          name: 'For Each Birthday Customer',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-3',
          type: NodeType.SEND_SMS,
          name: 'Send Birthday Discount',
          config: {
            to: '{{item.phone}}',
            message: '🎂 Happy Birthday {{item.name}}! Enjoy 20% OFF your next purchase with code BDAY20. Valid for 7 days. Shop now at {{store_url}}. - {{store_name}}',
          },
        },
        {
          id: 'node-4',
          type: NodeType.DATABASE_INSERT,
          name: 'Log Campaign',
          config: {
            table: 'marketing_campaigns',
            data: {
              customer_id: '{{item.id}}',
              campaign_type: 'birthday',
              discount_code: 'BDAY20',
              sent_date: '{{now}}',
            },
            database: 'store_db',
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

  // 6. Flash Sale Announcement
  {
    id: 'store-flash-sale',
    name: 'Flash Sale Announcement System',
    description: 'Instantly notify all customers about flash sales and limited-time offers',
    category: TemplateCategory.STORE,
    difficulty: TemplateDifficulty.INTERMEDIATE,
    tags: ['marketing', 'sales', 'promotions', 'sms', 'bulk-messaging'],
    icon: '⚡',
    estimatedSetupTime: 20,
    requiredIntegrations: ['twilio', 'database'],
    useCases: [
      'Announce flash sales',
      'Clear excess inventory',
      'Drive immediate traffic',
      'Boost revenue quickly',
    ],
    benefits: [
      'Instant customer reach',
      'Increases foot traffic',
      'Clears slow-moving stock',
      'Creates urgency',
    ],
    workflow: {
      type: 'workflow',
      name: 'Flash Sale Announcement System',
      description: 'Send flash sale alerts to all active customers',
      status: WorkflowStatus.DRAFT,
      trigger: {
        id: 'trigger',
        name: 'Webhook Trigger',
        type: NodeType.WEBHOOK,
        config: {
          path: '/flash-sale/announce',
          method: 'POST',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: NodeType.DATABASE_QUERY,
          name: 'Get Active Customers',
          config: {
            query: 'SELECT * FROM customers WHERE active = 1 AND sms_opt_in = 1',
            database: 'store_db',
          },
        },
        {
          id: 'node-2',
          type: NodeType.CONDITION,
          name: 'Check Customer Count',
          config: {
            condition: 'input.length > 0',
          },
        },
        {
          id: 'node-3',
          type: NodeType.LOOP,
          name: 'For Each Customer',
          config: {
            items: '{{node-1.output}}',
          },
        },
        {
          id: 'node-4',
          type: NodeType.SEND_SMS,
          name: 'Send Flash Sale Alert',
          config: {
            to: '{{item.phone}}',
            message: '⚡ FLASH SALE! {{trigger.discount}}% OFF {{trigger.product_category}} for the next {{trigger.duration}} hours! Shop now: {{store_url}} - {{store_name}}',
          },
        },
        {
          id: 'node-5',
          type: NodeType.DELAY,
          name: 'Rate Limit',
          config: {
            duration: 1, // 1 second delay between messages
          },
        },
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3', condition: 'true' },
        { from: 'node-3', to: 'node-4' },
        { from: 'node-4', to: 'node-5' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

