import type { D1Database } from '@cloudflare/workers-types';
import { generateId, now, auditLog } from './types';

// Kenyan names pool
const firstNames = ['James', 'Mary', 'David', 'Grace', 'John', 'Susan', 'Peter', 'Margaret', 'Paul', 'Anne', 'Michael', 'Patricia'];
const lastNames = ['Kipchoge', 'Mwangi', 'Ochieng', 'Kariuki', 'Wanjiru', 'Kimani', 'Kiplagat', 'Muriithi', 'Juma', 'Ndegwa', 'Kamau', 'Okoro'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateKenyanName(): string {
  return `${randomElement(firstNames)} ${randomElement(lastNames)}`;
}

function generatePhoneNumber(): string {
  const prefix = ['254701', '254702', '254703', '254704', '254705', '254710', '254711', '254712', '254713', '254714'];
  const prefixChoice = randomElement(prefix);
  const remaining = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return prefixChoice + remaining;
}

function dateAfter(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function dateBefore(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Chama descriptions
const chamaDescriptions = {
  'Office Savings Group': 'A professional savings group for office colleagues. Members contribute weekly to build emergency funds and investment capital.',
  'Community Welfare': 'A community-based welfare group providing mutual support during times of need. Members contribute monthly for harambee and group social projects.',
  'Investment Club': 'An investment-focused group pooling resources for property and business ventures. Members contribute quarterly to maximize returns.',
};

type ChamaName = keyof typeof chamaDescriptions;

export async function seedData(db: D1Database): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const timestamp = now();

    // 1. Get or create user@example.com account
    let userResult = await db.prepare(`SELECT id FROM users WHERE email = 'user@example.com'`).first() as any;
    let userId = userResult?.id;

    if (!userId) {
      userId = generateId();
      await db.prepare(`
        INSERT INTO users (id, email, name, phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(userId, 'user@example.com', 'Demo User', generatePhoneNumber(), timestamp, timestamp).run();
    }

    // 2. Create 3 diverse chamas
    const chamaNames: ChamaName[] = ['Office Savings Group', 'Community Welfare', 'Investment Club'];
    const chamas: Array<{ id: string; name: ChamaName; members: string[] }> = [];

    for (const name of chamaNames) {
      // Check if chama already exists
      let existingChama = await db.prepare(`SELECT id FROM chamas WHERE name = ?`).bind(name).first() as any;
      let chamaId = existingChama?.id;

      if (!chamaId) {
        chamaId = generateId();
        await db.prepare(`
          INSERT INTO chamas (id, name, description, currency, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(chamaId, name, chamaDescriptions[name], 'KES', timestamp, timestamp).run();

        // Log chama creation
        await auditLog(db, {
          chamaId,
          userId,
          action: 'CREATE',
          entity: 'CHAMA',
          entityId: chamaId,
          details: { name },
        });
      }

      chamas.push({ id: chamaId, name, members: [] });
    }

    // 3. Add 3-5 members to each chama (reduced from 8-10 to avoid CPU limits)
    const membersByChama: Record<string, string[]> = {};

    for (const chama of chamas) {
      const memberCount = randomAmount(3, 5);
      const chamaMembers: string[] = [];

      // First add the main user as admin (if not already)
      let existingAdminMembership = await db.prepare(`
        SELECT id FROM memberships WHERE user_id = ? AND chama_id = ? AND is_active = 1
      `).bind(userId, chama.id).first();

      if (existingAdminMembership) {
        chamaMembers.push(existingAdminMembership.id);
      } else {
        const adminMemberId = generateId();
        await db.prepare(`
          INSERT INTO memberships (id, user_id, chama_id, role, joined_at, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(adminMemberId, userId, chama.id, 'ADMIN', timestamp, 1).run();
        chamaMembers.push(adminMemberId);
      }

      // Add other members (reduced from 8-10 to 3-5)
      for (let i = 1; i < memberCount; i++) {
        const memberId = generateId();
        let memberName = generateKenyanName();
        let memberEmail = `${memberName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        
        // Ensure uniqueness - add random suffix if needed
        let emailExists = await db.prepare(`SELECT id FROM users WHERE email = ?`).bind(memberEmail).first() as any;
        let suffix = 1;
        while (emailExists && emailExists.id) {
          memberEmail = `${memberName.toLowerCase().replace(/\s+/g, '.')}.${suffix}@example.com`;
          emailExists = await db.prepare(`SELECT id FROM users WHERE email = ?`).bind(memberEmail).first() as any;
          suffix++;
        }

        let memberUserId = generateId();
        
        // Check if user already exists
        let existingUser = await db.prepare(`SELECT id FROM users WHERE email = ?`).bind(memberEmail).first() as any;
        if (existingUser && existingUser.id) {
          memberUserId = existingUser.id;
        } else {
          // Create user
          await db.prepare(`
            INSERT INTO users (id, email, name, phone, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(memberUserId, memberEmail, memberName, generatePhoneNumber(), timestamp, timestamp).run();
        }

        // Create membership (check for existing membership first)
        const existingMembership = await db.prepare(`
          SELECT id FROM memberships WHERE user_id = ? AND chama_id = ?
        `).bind(memberUserId, chama.id).first() as any;
        
        if (!existingMembership || !existingMembership.id) {
          const role = i === 1 ? 'TREASURER' : 'MEMBER';
          await db.prepare(`
            INSERT INTO memberships (id, user_id, chama_id, role, joined_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(memberId, memberUserId, chama.id, role, dateBefore(randomAmount(30, 180)), 1).run();
          chamaMembers.push(memberId);
        }
      }

      membersByChama[chama.id] = chamaMembers;
    }

    // 4. Create 2-3 contribution plans per chama
    const plansByChama: Record<string, string[]> = {};
    const planData: Array<{
      id: string;
      chamaId: string;
      frequency: string;
      amount: number;
      name: string;
    }> = [];

    const frequencies = ['WEEKLY', 'MONTHLY', 'DAILY'];
    const planNames: Record<string, string[]> = {
      'Office Savings Group': ['Weekly Savings', 'Emergency Fund'],
      'Community Welfare': ['Monthly Harambee', 'Hospital Fund', 'Education Support'],
      'Investment Club': ['Quarterly Investment', 'Property Fund', 'Business Venture'],
    };

    for (const chama of chamas) {
      const planCount = randomAmount(2, 3);
      const chamaPlanIds: string[] = [];

      for (let i = 0; i < planCount; i++) {
        const planId = generateId();
        const frequency = chama.name === 'Office Savings Group' ? frequencies[i] : frequencies[Math.floor(i / 2)];
        const amount = chama.name === 'Office Savings Group' ? randomAmount(500, 2000) : 
                       chama.name === 'Community Welfare' ? randomAmount(1000, 3000) :
                       randomAmount(5000, 15000);
        const planNames_forChama = planNames[chama.name] || [];
        const planName = planNames_forChama[i] || `Plan ${i + 1}`;

        await db.prepare(`
          INSERT INTO contribution_plans (id, chama_id, name, description, amount, frequency, start_date, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(planId, chama.id, planName, `${planName} for ${chama.name}`, amount, frequency, 
                dateBefore(60), 1, timestamp, timestamp).run();

        chamaPlanIds.push(planId);
        planData.push({ id: planId, chamaId: chama.id, frequency, amount, name: planName });
      }

      plansByChama[chama.id] = chamaPlanIds;
    }

    // 5 & 6. Generate contribution records with mixed statuses and overdue entries
    const contributionRecords: Array<{ id: string; chamaId: string; planId: string; status: string; amount: number; userId: string }> = [];

    for (const chama of chamas) {
      const chamaPlans = plansByChama[chama.id];
      const chamaMembers = membersByChama[chama.id];

      for (const planId of chamaPlans) {
        const plan = planData.find(p => p.id === planId)!;
        // Reduced from 5-8 to 2-3 per member per plan
        const recordsPerMember = randomAmount(2, 3);

        for (const memberId of chamaMembers) {
          const membershipData = await db.prepare(`
            SELECT user_id FROM memberships WHERE id = ?
          `).bind(memberId).first() as { user_id: string } | undefined;

          if (!membershipData) continue; // Skip if membership not found

          for (let i = 0; i < recordsPerMember; i++) {
            const recordId = generateId();
            
            // Mix of statuses: 20% overdue, 25% upcoming, 25% paid, 30% partially paid
            let status: string;
            let dueDate: string;
            
            const statusRand = Math.random();
            if (statusRand < 0.2) {
              status = 'OVERDUE';
              dueDate = dateBefore(randomAmount(5, 90));
            } else if (statusRand < 0.45) {
              status = 'UPCOMING';
              dueDate = dateAfter(randomAmount(1, 30));
            } else if (statusRand < 0.70) {
              status = 'PAID';
              dueDate = dateBefore(randomAmount(1, 60));
            } else {
              status = 'PARTIALLY_PAID';
              dueDate = dateBefore(randomAmount(5, 60));
            }

            const paidAmount = status === 'PAID' ? plan.amount : 
                               status === 'PARTIALLY_PAID' ? randomAmount(Math.floor(plan.amount * 0.3), Math.floor(plan.amount * 0.9)) :
                               0;

            await db.prepare(`
              INSERT INTO contribution_records 
              (id, plan_id, membership_id, user_id, amount, expected_amount, status, due_date, paid_at, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              recordId, planId, memberId, membershipData.user_id, paidAmount, plan.amount, status, dueDate,
              status === 'PAID' ? dateBefore(randomAmount(1, 30)) : null, timestamp, timestamp
            ).run();

            contributionRecords.push({ id: recordId, chamaId: chama.id, planId, status, amount: paidAmount, userId: membershipData.user_id });

            // Log contribution record creation
            await auditLog(db, {
              chamaId: chama.id,
              userId: membershipData.user_id,
              action: 'CREATE',
              entity: 'CONTRIBUTION_RECORD',
              entityId: recordId,
              details: { status, amount: paidAmount },
            });
          }
        }
      }
    }

    // Create payment records for paid/partially paid contributions
    for (const record of contributionRecords) {
      if (record.status === 'PAID' || record.status === 'PARTIALLY_PAID') {
        const paymentId = generateId();
        const paymentStatus = Math.random() < 0.95 ? 'SUCCESS' : 'FAILED';
        await db.prepare(`
          INSERT INTO payments (id, contribution_record_id, user_id, amount, currency, status, provider, provider_reference, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          paymentId, record.id, record.userId, record.amount, 'KES', paymentStatus, 'paystack',
          `PS-${generateId().substring(0, 8).toUpperCase()}`, timestamp, timestamp
        ).run();
      }
    }

    // 7. Generate audit log entries (already created during the process)
    // Add some additional generic audit logs
    const auditActions = ['LOGIN', 'VIEW', 'EXPORT', 'UPDATE'];
    for (let i = 0; i < 15; i++) {
      const chama = randomElement(chamas);
      const action = randomElement(auditActions);
      await auditLog(db, {
        chamaId: chama.id,
        userId,
        action,
        entity: 'CHAMA',
        entityId: chama.id,
      });
    }

    return {
      success: true,
      message: 'Database seeded successfully',
      data: {
        user: 'user@example.com',
        userCount: 1 + chamas.reduce((sum, c) => sum + (membersByChama[c.id].length - 1), 0),
        chamaCount: chamas.length,
        membershipCount: chamas.reduce((sum, c) => sum + membersByChama[c.id].length, 0),
        planCount: planData.length,
        contributionRecordCount: contributionRecords.length,
        chamaDetails: chamas.map(c => {
          const memberCount = membersByChama[c.id].length;
          const planCount = plansByChama[c.id].length;
          const recordCount = contributionRecords.filter(r => r.chamaId === c.id).length;
          return {
            name: c.name,
            members: memberCount,
            plans: planCount,
            contributions: recordCount,
            averageContributionsPerMember: memberCount > 0 ? (recordCount / memberCount).toFixed(1) : 0,
          };
        }),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
