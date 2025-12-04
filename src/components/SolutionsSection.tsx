import { Network, Crown, Link } from "lucide-react";
import { Card } from "@/components/ui/card";

const solutions = [{
  title: "One-Click Multichain Deploy",
  description: "Launch smart contract factories across 70+ blockchains instantly. No technical complexity, just results.",
  icon: Network
}, {
  title: "Governor NFT Membership",
  description: "Exclusive governance rights limited to 250 holders. Get early access to the 2026 Layer Zero omnichain NFT airdrop.",
  icon: Crown
}, {
  title: "VIP NFT Access Control",
  description: "Unlock exclusive features and premium tooling with blockchain-verified membership. True ownership, real utility.",
  icon: Crown
}, {
  title: "Non-Technical Fundraising",
  description: "Present working blockchain demos to investors without hiring developers. Deploy professional MVPs that showcase your vision instantly.",
  icon: Link
}];

export const SolutionsSection = () => {
  return (
    <section className="py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Enterprise-Grade Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock the power of blockchain technology with our comprehensive suite of tools designed for businesses and innovators.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {solution.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {solution.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};