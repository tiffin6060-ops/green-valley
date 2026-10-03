import { setRequestLocale } from "next-intl/server";
import About from "@/components/About";
import Ecosystem from "@/components/Ecosystem";
import FinalCTA from "@/components/FinalCTA";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import LiveFarm from "@/components/LiveFarm";
import Opportunities from "@/components/Opportunities";
import Progress from "@/components/Progress";
import Stats from "@/components/Stats";
import Transparency from "@/components/Transparency";
import VisitForm from "@/components/VisitForm";

export default async function Home({ params }: PageProps<"/[locale]">) {
  setRequestLocale((await params).locale);
  return (
    <main id="home">

      <Hero />
      <Stats />
      <Intro />
      <Ecosystem />
      <Opportunities />
      <Progress />
      <LiveFarm />
      <Transparency />
      <About />
      <VisitForm />
      <FinalCTA />
    </main>
  );
}
