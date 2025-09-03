import React from "react";

export default function TermsPage() {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Terms and Conditions</div>
      <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-4 text-sm text-slate-700">
        <div>
          <div className="font-medium text-slate-900">1. Class Structure</div>
          <p className="mt-1">
            Each class runs for 60 minutes and takes place once or twice per week – as
            agreed at enrollment. Lessons can be held in-person or online, depending on
            what works best for you.
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-900">2. Payments & Fees</div>
          <p className="mt-1">
            Fees are due at the start of each month (by the 1st) so we can keep everything
            running smoothly. Payments are non-refundable, unless a program is canceled by
            Learn Music with Ashwin.
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-900">3. Rescheduling & Cancellations</div>
          <p className="mt-1">
            If you need to cancel, please let me know at least 24 hours in advance so I can
            try to offer a make-up class. Since the student base is quite large, rescheduling
            options are limited — please reach out as early as possible. Most make-up classes,
            if available, will be on weekends as weekdays are usually fully booked. Last-minute
            cancellations cannot be entertained, and in such cases, a make-up class may not always
            be possible due to the busy schedule.
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-900">4. Public Holidays & Instructor Absence</div>
          <p className="mt-1">
            There will be no classes on public holidays unless otherwise announced. If I need to
            cancel a class, it will be rescheduled at a time that works for both of us.
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-900">5. Class Conduct & Materials</div>
          <p className="mt-1">
            Please arrive on time and bring your books, notes, and any required materials so we can
            make the most of each session.
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-900">6. Photography & Video</div>
          <p className="mt-1">
            Occasionally, I may take photos or short videos during lessons or events to share the joy of
            music learning. If you’d prefer not to have your (or your child’s) photo/video shared, just
            let me know in writing.
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-900">7. Safety & Security</div>
          <p className="mt-1">
            For everyone’s safety, a security camera is in operation inside the studio at all times.
          </p>
        </div>

        <div>
          <div className="font-medium text-slate-900">8. Liability</div>
          <p className="mt-1">
            Learn Music with Ashwin is not responsible for personal belongings brought to class.
            Parents/guardians are responsible for the safety and supervision of their children before
            and after class hours.
          </p>
        </div>

        <p className="text-xs text-slate-500">These terms may be updated periodically.</p>
      </div>
    </div>
  );
}
