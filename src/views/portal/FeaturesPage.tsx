export default function FeaturesPage() {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Portal Features</div>
      <div className="card-neutral rounded-2xl p-4 shadow-sm space-y-3 text-sm">
        <ul className="list-disc pl-5 space-y-1">
          <li>View upcoming lessons by month and day</li>
          <li>Homework tracking and completion status</li>
          <li>Secure sign-in to your student portal</li>
        </ul>
        <div className="pt-2 font-medium">Coming soon</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Class reminders via email/WhatsApp</li>
          <li>Direct payments from the portal</li>
          <li>Downloadable practice resources</li>
        </ul>
      </div>
    </div>
  );
}
