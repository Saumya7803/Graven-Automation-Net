interface CategorySEOContentProps {
  categoryName: string;
  categorySlug: string;
}

export const CategorySEOContent = ({ categoryName, categorySlug }: CategorySEOContentProps) => {
  return (
    <section className="py-12 bg-muted/20 border-t">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-sm text-muted-foreground">
          <p>
            Buy {categoryName} and industrial automation spare parts from Graven Automation. 
            We supply genuine automation components from leading manufacturers including 
            Schneider Electric, Siemens, Allen Bradley, Mitsubishi Electric, ABB, Delta, 
            Yaskawa, and more. Our products include variable frequency drives (VFDs), 
            programmable logic controllers (PLCs), human machine interfaces (HMIs), servo 
            systems, and related accessories.
          </p>
          <p>
            Serving customers across India with technical support, fast sourcing, and 
            competitive pricing. Whether you need replacement parts for maintenance, 
            new components for projects, or upgrades for existing systems, our team can 
            help you find the right solution. Contact us for bulk orders, custom 
            configurations, and urgent requirements.
          </p>
        </div>
      </div>
    </section>
  );
};
