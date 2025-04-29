import { convertToMarkdown } from "./markdown-converter"

/**
 * Test the markdown conversion with sample plain text
 */
export function testConversion() {
  const plainTextSamples = [
    // Sample 1: Basic heading and paragraph
    `Document Title
    
    This is a regular paragraph with some text.
    This is part of the same paragraph.
    
    Another paragraph here.`,

    // Sample 2: Subheading with list
    `Meeting Notes
    
    Agenda Items:
    1. Discuss project timeline
    2. Review budget
    3. Assign tasks
    
    Action items for next week.`,

    // Sample 3: Table example
    `Product Comparison
    
    Feature    Product A    Product B    Product C
    Price      $10.99       $15.99       $8.99
    Rating     4.5          3.8          4.2
    
    Based on the comparison, Product A offers the best value.`,

    // Sample 4: Mixed content
    `Quarterly Report
    
    Financial Summary:
    1. Revenue increased by 15%
    2. Expenses reduced by 7%
    3. Net profit up 22%
    
    Department    Budget    Actual    Variance
    Marketing     $50,000   $48,500   -$1,500
    Sales         $75,000   $82,000   +$7,000
    Operations    $120,000  $115,000  -$5,000
    
    Recommendations for next quarter based on these results.`,
  ]

  return plainTextSamples.map((sample) => ({
    original: sample,
    converted: convertToMarkdown(sample),
  }))
}
