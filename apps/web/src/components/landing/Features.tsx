import {
  FaMapMarkedAlt,
  FaQrcode,
  FaBell,
  FaUserShield,
  FaRoute,
  FaMobileAlt,
} from "react-icons/fa";

function Features() {
  const features = [
    {
      icon: <FaMapMarkedAlt size={40} />,
      title: "Live GPS Tracking",
      desc: "Track buses in real-time using Google Maps.",
    },
    {
      icon: <FaQrcode size={40} />,
      title: "QR Attendance",
      desc: "Students scan QR codes while boarding and exiting.",
    },
    {
      icon: <FaBell size={40} />,
      title: "Parent Alerts",
      desc: "Instant notifications for arrival and departure.",
    },
    {
      icon: <FaUserShield size={40} />,
      title: "Secure Login",
      desc: "Role-based login for Admin, Driver, Parent and Student.",
    },
    {
      icon: <FaRoute size={40} />,
      title: "Smart Route",
      desc: "Optimized routes with ETA prediction.",
    },
    {
      icon: <FaMobileAlt size={40} />,
      title: "Multi-platform",
      desc: "Works on Web, Mobile and Driver App.",
    },
  ];

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-4xl font-bold text-center mb-14">
          Key Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {features.map((item, index) => (

            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition duration-300"
            >

              <div className="text-blue-600 mb-5">
                {item.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                {item.title}
              </h3>

              <p className="text-gray-600">
                {item.desc}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;