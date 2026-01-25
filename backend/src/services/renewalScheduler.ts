import cron from 'node-cron';
import AssignService from '../models/assignService.routes';
import Profile from '../models/profile.model';
import NotificationService from './notificationService';



/**
 * Check renewals and send reminders at 7, 3, and 1 day before due date
 */
export const startRenewalReminderScheduler = () => {
  const cronSchedule = process.env.RENEWAL_CRON || '55 13 * * *'; // default daily at 1:55 pm

  const job = async () => {
    console.log('Running renewal reminder scheduler...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all assigned services with unpaid renewals (select only required fields)
      const assignedServices = await AssignService.find({
        'renewal_dates': { $exists: true, $ne: [] }
      })
      .select('email client_name service_name client_id renewal_dates')
      .populate({
        path: 'client_id',
        select: 'email phone'
      });
      console.log(`Found ${assignedServices.length} assigned services with renewals to check`);
      for (const service of assignedServices) { 
        const clientProfile = await Profile.findById(service.client_id);
        if (!clientProfile) continue;

        for (const renewal of service.renewal_dates || []) {
          // Skip if already paid
          if (renewal.haspaid) continue;

          // Skip if no date available
          if (!renewal.date) continue;
          const renewalDate = new Date(renewal.date);
          renewalDate.setHours(0, 0, 0, 0);

          // Calculate days until renewal
          const diffTime = renewalDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Log all renewal dates being checked
          console.log(`Checking renewal: ${renewal.label} | Due: ${renewalDate.toISOString().split('T')[0]} | Days until: ${diffDays} | Paid: ${renewal.haspaid}`);

          // Send reminder at 7, 3, or 1 day before
          if (diffDays === 7 || diffDays === 3 || diffDays === 1) {
            console.log(`✅ SENDING ${diffDays}-day reminder for: ${renewal.label} to ${service.email}`);

            try {
              await NotificationService.notifyRenewalReminder({
                email: service.email || undefined,
                phone: clientProfile.phone || undefined,
                clientName: service.client_name || undefined,
                serviceName: service.service_name || undefined,
                renewalLabel: renewal.label || undefined,
                renewalDate: renewal.date ? (new Date(renewal.date)).toISOString() : undefined,
                renewalPrice: typeof renewal.price === 'number' ? renewal.price : undefined,
                daysUntilRenewal: diffDays
              });
              console.log(`✅ Reminder sent successfully`);
            } catch (err) {
              console.error(`❌ Failed to send reminder for ${renewal.label}:`, err);
            }
          }
        }
      }

      console.log('Renewal reminder scheduler completed');
    } catch (error) {
      console.error('Error in renewal reminder scheduler:', error);
    }
  };

  // Schedule the cron job using configured schedule
  cron.schedule(cronSchedule, job);

  // If RUN_RENEWAL_NOW is set, run job immediately for testing
  if (process.env.RUN_RENEWAL_NOW === 'true') {
    console.log('RUN_RENEWAL_NOW detected — executing renewal reminders immediately for testing');
    job().catch(err => console.error('Immediate renewal job error:', err));
  }

  console.log(`Renewal reminder scheduler started (schedule: ${cronSchedule})`);
};
