import { motion } from 'framer-motion';
import { Scale, Shield, FileText, UserCheck, AlertTriangle } from 'lucide-react';

export const TermsOfUse = () => {
  const sections = [
    {
      icon: <UserCheck className="text-[#1a3a75]" size={24} />,
      title: '1. Account Eligibility and Creation',
      content:
        'To join the SSGMCE Alumni Connect Portal, you must be a graduate, former student, or staff member of SSGMCE Shegaon. You agree that the details supplied during registration are accurate, complete, and represent your true identity. You understand that submitting a registration request will create a pending portal account, which is subject to administrative review and approval.',
    },
    {
      icon: <Scale className="text-[#1a3a75]" size={24} />,
      title: '2. Code of Conduct',
      content:
        'As a member of this portal, you agree to interact respectfully and professionally with fellow alumni, students, and staff. You will not post offensive, defamatory, or inappropriate material, nor will you use the platform for unauthorized commercial promotion, spamming, or harassment. Administrators reserve the right to suspend or terminate accounts that violate this code.',
    },
    {
      icon: <Shield className="text-[#1a3a75]" size={24} />,
      title: '3. Data Privacy and Security',
      content:
        'Your profile information, including contact details and professional records, is stored securely and used solely to foster connection and collaboration within the SSGMCE network. We will not share your personal data with third-party advertising services. You are responsible for keeping your login credentials confidential and notifying us of any security breaches.',
    },
    {
      icon: <FileText className="text-[#1a3a75]" size={24} />,
      title: '4. Authentication and Third-Party Links',
      content:
        'Registration and login services utilize Firebase authentication (which may include Google and LinkedIn providers). If you associate a password with your registered email, it is securely stored by Firebase to facilitate future account linking and login. The portal contains links to institutional resources and member professional links; we are not responsible for the privacy practices of external sites.',
    },
    {
      icon: <AlertTriangle className="text-[#1a3a75]" size={24} />,
      title: '5. Modifications and Disclaimers',
      content:
        'SSGMCE Shegaon reserves the right to modify these terms, update portal features, or disable platform access at any time. The portal is provided on an "as-is" basis, and while we strive to maintain accurate data, the institution does not guarantee that the directory or posted content is entirely error-free.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1a3a75] to-[#2563eb] text-white rounded-3xl p-8 md:p-12 shadow-xl mb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Scale size={320} />
        </div>
        <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block mb-4">
          Legal Agreement
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Terms of Use</h1>
        <p className="mt-3 text-blue-100 max-w-2xl text-sm md:text-base font-medium leading-relaxed">
          Please read these terms carefully before completing your alumni registration. By creating an account, you agree to abide by these guidelines and help maintain a secure, collaborative community.
        </p>
        <div className="mt-6 border-t border-white/20 pt-4 text-xs text-blue-200">
          Last updated: July 15, 2026
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-[#cbd5e1]/50 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#eff6ff] rounded-xl shrink-0">
                {section.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-xs text-gray-400 font-semibold"
      >
        For any questions regarding these terms, please contact the SSGMCE Alumni Association admin.
      </motion.div>
    </div>
  );
};
