import { useEffect, useState } from "react";
import { acceptMyTerms, getMyStudents, type Student } from "../../hooks/students";

export default function TermsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const list = await getMyStudents();
      setStudents(list);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const allAccepted = students.length > 0 && students.every((s) => s.termsAccepted);

  async function accept() {
    setSaving(true);
    try {
      await acceptMyTerms();
      await refresh();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Could not accept");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Terms and Conditions</div>
      <div className="card-neutral rounded-2xl p-4 shadow-sm space-y-4 text-sm">
        <Section
          title="1. Class Structure"
          items={[
            "1.1. Each lesson runs for 60 minutes and occurs once or twice per week, depending on enrollment.",
            "1.2. Lessons may be conducted in-person or online.",
            "1.3. Each student's class time is reserved exclusively for them every month.",
            "1.4. At present, all lessons are taught solely by Ashwin.",
          ]}
        />

        <Section
          title="2. Enrollment & Demo Classes"
          items={[
            "2.1. Enrollment begins once the first month's payment is completed.",
            "2.2. Demo classes, if offered, are one-time sessions and do not secure a permanent time slot.",
            "2.3. Class timings are assigned based on availability.",
          ]}
        />

        <Section
          title="3. Payments, Fees & Late Charges"
          items={[
            "3.1. Monthly fees are due at the start of each month (by the 1st).",
            "3.2. A grace period is provided until the 5th of the month.",
            "3.3. Payments made after the 5th will incur a $10 late fee.",
            "3.4. Repeated late payments may require the student to be moved to mandatory Stripe auto-pay.",
            "3.5. All payments are non-refundable, unless lessons are canceled by Ashwin’s Piano Studio.",
            "3.6. Payment is required to hold the student’s time slot, even if classes are missed.",
          ]}
        />

        <Section
          title="4. Rescheduling & Cancellations"
          items={[
            "4.1. Make-Up Eligibility (Who Qualifies)",
            "Only the following situations may qualify for a make-up class:",
            "• Illness (same-day notice accepted) — limited to one same-day medical cancellation per month",
            "• Unavoidable emergencies (rare and legitimate)",
            "• 24+ hours advance notice, depending on availability",
          ]}
        >
          <div className="mt-2">
            <div className="font-medium text-white">4.2. Situations That Do NOT Qualify</div>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Birthday parties, travel, social events</li>
              <li>School assignments, regular school activities</li>
              <li>Forgetting the class</li>
              <li>Traffic delays or late arrival</li>
              <li>Any cancellation with less than 24 hours notice (unless it falls under approved medical/emergency categories)</li>
            </ul>
          </div>
          <div className="mt-2">
            <div className="font-medium text-white">4.3. Additional Make-Up Rules</div>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>4.3.1. Make-up classes are not guaranteed and depend strictly on availability.</li>
              <li>4.3.2. Most make-up classes, if available, will be scheduled on weekends.</li>
              <li>4.3.3. All make-ups must be completed within the same month.</li>
              <li>4.3.4. Lessons missed due to late arrival end at the regular time.</li>
            </ul>
          </div>
        </Section>

        <Section
          title="5. Class Breaks & Discontinuation Policy"
          items={[
            "5.1. A minimum of 2 weeks' written notice (WhatsApp/email) is required before taking a break or discontinuing.",
            "5.2. Notice given after the new month begins may still require full payment for that month.",
            "5.3. Students who pause lessons without payment may lose their reserved time slot.",
            "5.4. Returning students will be scheduled based on current availability.",
          ]}
        />

        <Section
          title="6. Public Holidays, Instructor Vacations & Emergency Closures"
          items={[
            "6.1. No classes are held on public holidays, unless otherwise announced.",
            "6.2. Ashwin may take scheduled vacations with advance notice to parents/students.",
            "6.3. Lessons canceled by the instructor will be rescheduled.",
            "6.4. In cases of severe weather, power outages, or emergencies: lessons may be moved online, or rescheduled, or credited, depending on the situation.",
          ]}
        />

        <Section
          title="7. Late Arrival & No-Show Policy"
          items={[
            "7.1. Lessons begin and end at the scheduled time, regardless of when the student arrives.",
            "7.2. A student who does not attend a class without notice will forfeit the lesson, with no make-up.",
          ]}
        />

        <Section
          title="8. Class Conduct & Materials"
          items={[
            "8.1. Students must arrive with all required materials (books, notebooks, etc.).",
            "8.2. Respectful behaviour is expected from students and accompanying adults.",
            "8.3. Disruptive behaviour may result in early termination of the lesson or discontinuation of enrollment.",
          ]}
        />

        <Section
          title="9. Practice & Homework"
          items={[
            "9.1. Consistent practice is crucial — at least 10-20 minutes daily.",
            "9.2. Homework or practice tasks must be completed before the next lesson.",
            "9.3. Parents are encouraged to help younger students follow a practice routine.",
          ]}
        />

        <Section
          title="10. Equipment & Online Lesson Requirements"
          items={[
            "10.1. Students must have access to a proper keyboard/piano for home practice.",
            "10.2. Online lessons require a stable internet connection and a quiet environment.",
            "10.3. Technical issues on the student's side will not extend the lesson.",
          ]}
        />

        <Section
          title="11. Photography, Video & Media Consent"
          items={[
            "11.1. Photos or videos may be taken for educational or promotional use.",
            "11.2. If you prefer not to have your (or your child's) image used, please inform in writing.",
            "11.3. Lesson recordings, if made, are for studio use only.",
          ]}
        />

        <Section
          title="12. Safety & Security"
          items={[
            "12.1. A security camera operates inside the studio for safety.",
            "12.2. The studio is not responsible for lost or damaged personal belongings.",
            "12.3. Parents are responsible for their child's safety before and after class hours.",
          ]}
        />

        <Section
          title="13. Data & Privacy"
          items={[
            "13.1. Basic information (name, contact, payment details) is securely stored for lesson administration.",
            "13.2. Information is not shared except for payment processing (e.g., Stripe).",
            "13.3. Primary communication channels: WhatsApp and email.",
          ]}
        />

        <Section
          title="14. Liability"
          items={[
            "14.1. The studio is not liable for injuries or accidents occurring before, during, or after lessons.",
            "14.2. Parents/guardians remain responsible for supervision outside lesson times.",
          ]}
        />

        <Section
          title="15. Agreement & Updates"
          items={[
            "15.1. By enrolling, you agree to all Terms & Conditions listed.",
            "15.2. These policies may be updated periodically, with notice provided.",
          ]}
        />
      </div>
      <div className="card-neutral rounded-2xl p-4 shadow-sm space-y-3">
        {err && <div className="text-rose-600">{err}</div>}
        <div className="text-xs opacity-80">If there is any issues with the terms and conditions please contact me.</div>
        {!allAccepted && (
          <div>
            <button
              disabled={saving || loading}
              onClick={accept}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Accept Terms"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, children }: { title: string; items: string[]; children?: React.ReactNode }) {
  return (
    <div>
      <div className="font-medium text-white">{title}</div>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
      {children}
    </div>
  );
}
