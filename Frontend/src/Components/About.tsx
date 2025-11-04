
export default function AboutPage() {
  return (
    <div className="bg-[#f6f8fc] min-h-screen py-16 px-6 md:px-24 flex flex-col md:flex-row items-center gap-12">
      
      {/* Mission Card */}
      <div className="bg-white p-1 rounded-3xl shadow-lg border border-purple-300">
        <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-green-100 p-10 rounded-2xl text-center w-full max-w-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-8">
            At MoodMigo, we believe that mental health support should be accessible,
            personalized, and stigma-free for everyone.
          </p>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-purple-700">5K+</p>
              <p className="text-sm text-gray-600">Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">100+</p>
              <p className="text-sm text-gray-600">Psychiatrists</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">24/7</p>
              <p className="text-sm text-gray-600">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Content */}
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About MoodMigo</h1>
        <p className="text-gray-700 mb-4 text-lg">
          MoodMigo was founded with a simple yet powerful vision: to make mental health support
          accessible, personalized, and stigma-free for everyone.
        </p>
        <p className="text-gray-700 mb-4">
          Our team of mental health professionals, technologists, and passionate advocates have
          created a platform that combines human expertise with innovative technology to provide
          comprehensive mental wellness support.
        </p>
        <p className="text-gray-700 mb-6">
          Whether you're seeking professional guidance, a supportive community, or tools to manage
          your mental wellbeing, MoodMigo is here to accompany you on your journey toward better
          mental health.
        </p>
      </div>
    </div>
  );
}
