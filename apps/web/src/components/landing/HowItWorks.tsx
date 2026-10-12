import {
  FaMapMarkerAlt,
  FaBus,
  FaQrcode,
  FaBell,
} from "react-icons/fa";

function HowItWorks() {
  const steps = [
    {
      icon: <FaMapMarkerAlt size={35} />,
      title: "1. Live Bus Location",
      desc: "The driver's mobile continuously sends GPS coordinates.",
    },
    {
      icon: <FaBus size={35} />,
      title: "2. Real-Time Tracking",
      desc: "Students and parents can view the bus on Google Maps.",
    },
    {
      icon: <FaQrcode size={35} />,
      title: "3. QR Attendance",
      desc: "Students scan a QR code while boarding and leaving the bus.",
    },
    {
      icon: <FaBell size={35} />,
      title: "4. Instant Alerts",
      desc: "Parents receive notifications when students board, exit, or the bus is nearby.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-4xl font-bold text-center mb-14">
          How It Works
        </h2>

        <div className="grid md:grid-cols-4 gap-8">

          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-xl shadow-lg hover:shadow-xl transition"
            >
              <div className="text-blue-600 flex justify-center mb-4">
                {step.icon}
              </div>

              <h3 className="font-bold text-xl mb-3">
                {step.title}
              </h3>

              <p className="text-gray-600">
                {step.desc}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;