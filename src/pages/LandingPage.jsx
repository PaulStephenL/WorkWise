import { BriefcaseIcon } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Link } from "react-router-dom";

// Import images from src/assets
import groupIcon from '../assets/group.png'
import resumeIcon from '../assets/resume.svg'
import financeIcon from '../assets/finance.svg'
import manImage from '../assets/man-4365597-1920-1.png'
import workImage from '../assets/work-4166471-1280-1.png'

export const LandingPage = () => {

  // Features data
  const features = [
    {
      title: "Career Opportunities",
      subtitle: "Diverse Roles",
      description:
        "Connects users with a wide range of job opportunities across industries, offering roles that align with their skills, qualifications, and career goals.",
      icon: groupIcon,
    },
    {
      title: "Ease of Access",
      subtitle: "Streamlined Applications",
      description:
        "Provides an easy-to-navigate platform where users can search, apply, and track job applications efficiently, saving time and effort.",
      icon: resumeIcon,
    },
    {
      title: "Skill Development",
      subtitle: "Personalized Growth",
      description:
        "Offers resources like career advice, resume-building tips, and skill-assessment tools to help users enhance their professional profile and stay competitive.",
      icon: financeIcon,
    },
  ];

  return (
    <div className="bg-[#4d6a6d] flex flex-row justify-center w-full min-h-screen overflow-x-hidden">
      <div className="bg-[#4d6a6d] w-full max-w-[1440px]">
        <div className="relative">

          {/* Hero Section */}
          <section className="flex flex-col md:flex-row w-full px-4 md:px-[103px] mt-[69px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full md:w-[500px] h-[400px] md:h-[705px]"
            >
              <img
                className="w-full h-full object-cover rounded-lg"
                alt="Man"
                src={manImage}
                />
                </motion.div>
                <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col items-center md:items-start md:ml-[100px] mt-8 md:mt-[100px]"
            >
              <h2 className="[font-family:'Sedan',Helvetica] font-normal text-[#101d42] text-4xl md:text-5xl text-center md:text-left tracking-[0.50px] leading-10">
                Find Your Dream Job
              </h2>
              <p className="[font-family:'Sedan',Helvetica] font-normal text-white text-2xl md:text-[28px] text-center md:text-left tracking-[0.50px] leading-[45px] mt-5">
                Connect with top companies <br />
                and opportunities that match <br />
                your skills and aspirations
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/home">
                <Button className="mt-10 w-[196px] h-[57px] bg-[#efa26a] rounded-[28px] [font-family:'Sedan',Helvetica] font-normal text-black text-2xl tracking-[0.50px] hover:bg-[#e09058] transition-colors">
                Find Jobs
                </Button>
                </Link>
              </motion.div>
            </motion.div>
          </section>

          {/* Our Focus Section */}
          <section className="w-full px-4 md:px-[72px] mt-[100px] md:mt-[229px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="[font-family:'Sedan',Helvetica] font-normal text-[#101d42] text-4xl md:text-5xl text-center tracking-[0.50px] leading-10"
            >
              Our Focus
            </motion.h2>
            <div className="flex flex-col md:flex-row mt-10 md:mt-20">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-[525px] [font-family:'Sedan',Helvetica] font-normal text-white text-lg md:text-[32px] tracking-[0.50px] leading-[40px] md:leading-[50px]"
              >
                Empowering individuals by connecting them to meaningful job
                opportunities, while providing tools and resources for
                professional growth and career success.
              </motion.p>
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-[618px] h-[400px] md:h-[615px] mt-8 md:mt-0 md:ml-[92px] object-cover rounded-lg"
                alt="Work"
                src={workImage}
              />
            </div>

            {/* Features Grid */}
            <div className="mt-[83px]">
              <Separator className="w-full md:w-[1235px] h-px mx-auto mb-10" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-x-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <img
                      className="w-[69px] h-[79px] mb-4"
                      alt={feature.title}
                      src={feature.icon}
                    />
                    <h3 className="[font-family:'Sedan',Helvetica] font-normal text-[#101d42] text-2xl text-center tracking-[0.50px] leading-10">
                      {feature.title}
                    </h3>
                    <h4 className="[font-family:'Sedan',Helvetica] font-normal text-[#101d42] text-xl text-center tracking-[0.50px] leading-8 mt-2">
                      {feature.subtitle}
                    </h4>
                    <Card className="border-none shadow-none mt-4">
                      <CardContent className="p-4">
                        <p className="[font-family:'Sedan',Helvetica] font-normal text-white text-lg md:text-2xl tracking-[0.50px] leading-[30px] text-center">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Separator className="w-full md:w-[1235px] h-px mx-auto my-10" />
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
};