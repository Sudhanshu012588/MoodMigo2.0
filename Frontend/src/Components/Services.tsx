
const services = [
  {
    title: "Online Counselling Sessions",
    description:
      "Connect with certified psychiatrists from the comfort of your home for personalized mental health guidance.",
    icon: "🎧",
    link: `/sessions`,
    premium: false,
    borderColor: "border-violet-400",
  },
  {
    title: "Journal",
    description:
      "Write and reflect on your thoughts with our digital journaling tool designed to track your mental wellness journey.",
    icon: "📔",
    link: `/journal`,
    premium: "Learn More",
    borderColor: "border-violet-400",
  },
  {
    title: "MANARAH Chatbot",
    description:
      "Our multilingual AI chatbot provides support through text or voice chat, available for 3 hours daily with premium access.",
    icon: "🤖",
    link: "/chat",
    premium: "Learn More",
    borderColor: "border-green-200",
  },
  {
    title: "Community",
    description:
      "Join a supportive community where you can share experiences, discuss challenges, and connect with others on similar journeys.",
    icon: "👥",
    link: "/blog",
    premium: "Learn More",
    borderColor: "border-violet-400",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-gradient-to-b from-white to-[#F5F5FC] py-20 px-6 md:px-12 text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">Our Services</h2>
      <p className="text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
        Comprehensive mental health support tailored to your needs
      </p>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {services.map((service, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl p-6 shadow-md text-left border-t-4 ${service.borderColor} transition hover:shadow-lg`}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-2xl rounded-full mr-3">
                {service.icon}
              </div>
              <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                {service.title}
                {/* {service.premium && (
                  <span className="ml-2 text-xs bg-yellow-500 text-white font-bold px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )} */}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{service.description}</p>
            <a
              href="#"
              className={`text-sm font-semibold ${
                service.premium ? "text-purple-600" : "text-indigo-600"
              } hover:underline`}
            >
              <button>Learn More</button>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
