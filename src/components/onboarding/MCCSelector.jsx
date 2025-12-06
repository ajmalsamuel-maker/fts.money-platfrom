import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, AlertCircle } from 'lucide-react';

// Comprehensive MCC Codes List
const mccCodes = [
    // Agricultural Services
    { code: '0742', description: 'Veterinary Services', category: 'Agricultural' },
    { code: '0763', description: 'Agricultural Cooperatives', category: 'Agricultural' },
    { code: '0780', description: 'Horticultural Services', category: 'Agricultural' },
    
    // Transportation
    { code: '4111', description: 'Local/Suburban Commuter Transportation', category: 'Transportation' },
    { code: '4112', description: 'Passenger Railways', category: 'Transportation' },
    { code: '4119', description: 'Ambulance Services', category: 'Transportation' },
    { code: '4121', description: 'Taxicabs and Limousines', category: 'Transportation' },
    { code: '4131', description: 'Bus Lines', category: 'Transportation' },
    { code: '4214', description: 'Motor Freight Carriers, Moving and Storage', category: 'Transportation' },
    { code: '4215', description: 'Courier Services - Air and Ground', category: 'Transportation' },
    { code: '4225', description: 'Public Warehousing - Storage', category: 'Transportation' },
    { code: '4411', description: 'Cruise Lines', category: 'Transportation' },
    { code: '4457', description: 'Boat Rentals and Leasing', category: 'Transportation' },
    { code: '4468', description: 'Marinas, Marine Service/Supplies', category: 'Transportation' },
    { code: '4511', description: 'Airlines and Air Carriers', category: 'Transportation' },
    { code: '4582', description: 'Airports, Flying Fields, Airport Terminals', category: 'Transportation' },
    { code: '4722', description: 'Travel Agencies and Tour Operators', category: 'Transportation' },
    { code: '4784', description: 'Tolls and Bridge Fees', category: 'Transportation' },
    { code: '4789', description: 'Transportation Services', category: 'Transportation' },
    
    // Utilities
    { code: '4812', description: 'Telecommunication Equipment and Telephone Sales', category: 'Utilities' },
    { code: '4814', description: 'Telecommunication Services', category: 'Utilities' },
    { code: '4816', description: 'Computer Network/Information Services', category: 'Utilities' },
    { code: '4821', description: 'Telegraph Services', category: 'Utilities' },
    { code: '4829', description: 'Wire Transfers and Money Orders', category: 'Utilities' },
    { code: '4899', description: 'Cable and Other Pay Television Services', category: 'Utilities' },
    { code: '4900', description: 'Electric, Gas, Sanitary and Water Utilities', category: 'Utilities' },
    
    // Retail - General
    { code: '5013', description: 'Motor Vehicle Supplies and New Parts', category: 'Retail' },
    { code: '5021', description: 'Office and Commercial Furniture', category: 'Retail' },
    { code: '5039', description: 'Construction Materials', category: 'Retail' },
    { code: '5044', description: 'Office Equipment', category: 'Retail' },
    { code: '5045', description: 'Computers, Computer Peripheral Equipment, Software', category: 'Retail' },
    { code: '5046', description: 'Commercial Equipment', category: 'Retail' },
    { code: '5047', description: 'Medical, Dental Equipment and Supplies', category: 'Retail' },
    { code: '5051', description: 'Metal Service Centers and Offices', category: 'Retail' },
    { code: '5065', description: 'Electrical Parts and Equipment', category: 'Retail' },
    { code: '5072', description: 'Hardware Equipment and Supplies', category: 'Retail' },
    { code: '5074', description: 'Plumbing and Heating Equipment', category: 'Retail' },
    { code: '5085', description: 'Industrial Supplies', category: 'Retail' },
    { code: '5094', description: 'Precious Stones, Metals, Watches and Jewelry', category: 'Retail' },
    { code: '5099', description: 'Durable Goods', category: 'Retail' },
    { code: '5111', description: 'Stationery, Office Supplies, Printing and Writing Paper', category: 'Retail' },
    { code: '5122', description: 'Drugs, Drug Proprietors', category: 'Retail' },
    { code: '5131', description: 'Piece Goods, Notions, and Other Dry Goods', category: 'Retail' },
    { code: '5137', description: 'Men\'s, Women\'s and Children\'s Uniforms', category: 'Retail' },
    { code: '5139', description: 'Commercial Footwear', category: 'Retail' },
    { code: '5169', description: 'Chemicals and Allied Products', category: 'Retail' },
    { code: '5172', description: 'Petroleum and Petroleum Products', category: 'Retail' },
    { code: '5192', description: 'Books, Periodicals and Newspapers', category: 'Retail' },
    { code: '5193', description: 'Florists Supplies, Nursery Stock and Flowers', category: 'Retail' },
    { code: '5198', description: 'Paints, Varnishes and Supplies', category: 'Retail' },
    { code: '5199', description: 'Non-durable Goods', category: 'Retail' },
    
    // Retail Outlets
    { code: '5200', description: 'Home Supply Warehouse Stores', category: 'Retail' },
    { code: '5211', description: 'Lumber and Building Materials Stores', category: 'Retail' },
    { code: '5231', description: 'Glass, Paint, and Wallpaper Stores', category: 'Retail' },
    { code: '5251', description: 'Hardware Stores', category: 'Retail' },
    { code: '5261', description: 'Nurseries - Lawn and Garden Supply Store', category: 'Retail' },
    { code: '5271', description: 'Mobile Home Dealers', category: 'Retail' },
    { code: '5300', description: 'Wholesale Clubs', category: 'Retail' },
    { code: '5309', description: 'Duty Free Store', category: 'Retail' },
    { code: '5310', description: 'Discount Stores', category: 'Retail' },
    { code: '5311', description: 'Department Stores', category: 'Retail' },
    { code: '5331', description: 'Variety Stores', category: 'Retail' },
    { code: '5399', description: 'Misc. General Merchandise', category: 'Retail' },
    { code: '5411', description: 'Grocery Stores, Supermarkets', category: 'Retail' },
    { code: '5422', description: 'Freezer and Locker Meat Provisioners', category: 'Retail' },
    { code: '5441', description: 'Candy, Nut, and Confectionery Stores', category: 'Retail' },
    { code: '5451', description: 'Dairy Products Stores', category: 'Retail' },
    { code: '5462', description: 'Bakeries', category: 'Retail' },
    { code: '5499', description: 'Misc. Food Stores', category: 'Retail' },
    { code: '5511', description: 'Car and Truck Dealers (New and Used)', category: 'Automotive' },
    { code: '5521', description: 'Car and Truck Dealers (Used Only)', category: 'Automotive' },
    { code: '5531', description: 'Auto and Home Supply Stores', category: 'Automotive' },
    { code: '5532', description: 'Automotive Tire Stores', category: 'Automotive' },
    { code: '5533', description: 'Automotive Parts and Accessories', category: 'Automotive' },
    { code: '5541', description: 'Service Stations (with or without ancillary services)', category: 'Automotive' },
    { code: '5542', description: 'Automated Fuel Dispensers', category: 'Automotive' },
    { code: '5551', description: 'Boat Dealers', category: 'Automotive' },
    { code: '5561', description: 'Motorcycle Shops and Dealers', category: 'Automotive' },
    { code: '5571', description: 'Motorcycle Shops, Dealers', category: 'Automotive' },
    { code: '5592', description: 'Motor Home Dealers', category: 'Automotive' },
    { code: '5598', description: 'Snowmobile Dealers', category: 'Automotive' },
    { code: '5599', description: 'Misc. Automotive, Aircraft, and Farm Equipment Dealers', category: 'Automotive' },
    
    // Apparel
    { code: '5611', description: 'Men\'s and Boy\'s Clothing and Accessories Stores', category: 'Apparel' },
    { code: '5621', description: 'Women\'s Ready-to-Wear Stores', category: 'Apparel' },
    { code: '5631', description: 'Women\'s Accessory and Specialty Shops', category: 'Apparel' },
    { code: '5641', description: 'Children\'s and Infant\'s Wear Stores', category: 'Apparel' },
    { code: '5651', description: 'Family Clothing Stores', category: 'Apparel' },
    { code: '5655', description: 'Sports and Riding Apparel Stores', category: 'Apparel' },
    { code: '5661', description: 'Shoe Stores', category: 'Apparel' },
    { code: '5681', description: 'Furriers and Fur Shops', category: 'Apparel' },
    { code: '5691', description: 'Men\'s and Women\'s Clothing Stores', category: 'Apparel' },
    { code: '5697', description: 'Tailors, Seamstress, Mending, and Alterations', category: 'Apparel' },
    { code: '5698', description: 'Wig and Toupee Stores', category: 'Apparel' },
    { code: '5699', description: 'Misc. Apparel and Accessory Shops', category: 'Apparel' },
    
    // Home & Furniture
    { code: '5712', description: 'Furniture, Home Furnishings, and Equipment Stores', category: 'Home' },
    { code: '5713', description: 'Floor Covering Stores', category: 'Home' },
    { code: '5714', description: 'Drapery, Window Covering, and Upholstery Stores', category: 'Home' },
    { code: '5718', description: 'Fireplace, Fireplace Screens, and Accessories Stores', category: 'Home' },
    { code: '5719', description: 'Misc. Home Furnishing Specialty Stores', category: 'Home' },
    { code: '5722', description: 'Household Appliance Stores', category: 'Home' },
    { code: '5732', description: 'Electronics Stores', category: 'Electronics' },
    { code: '5733', description: 'Music Stores - Musical Instruments, Pianos, and Sheet Music', category: 'Electronics' },
    { code: '5734', description: 'Computer Software Stores', category: 'Electronics' },
    { code: '5735', description: 'Record Shops', category: 'Electronics' },
    { code: '5811', description: 'Caterers', category: 'Food & Beverage' },
    { code: '5812', description: 'Eating Places and Restaurants', category: 'Food & Beverage' },
    { code: '5813', description: 'Drinking Places (Alcoholic Beverages)', category: 'Food & Beverage' },
    { code: '5814', description: 'Fast Food Restaurants', category: 'Food & Beverage' },
    
    // Retail Stores
    { code: '5912', description: 'Drug Stores and Pharmacies', category: 'Retail' },
    { code: '5921', description: 'Package Stores - Beer, Wine, and Liquor', category: 'Retail' },
    { code: '5931', description: 'Used Merchandise and Secondhand Stores', category: 'Retail' },
    { code: '5932', description: 'Antique Shops', category: 'Retail' },
    { code: '5933', description: 'Pawn Shops', category: 'Retail' },
    { code: '5935', description: 'Wrecking and Salvage Yards', category: 'Retail' },
    { code: '5937', description: 'Antique Reproduction Stores', category: 'Retail' },
    { code: '5940', description: 'Bicycle Shops', category: 'Retail' },
    { code: '5941', description: 'Sporting Goods Stores', category: 'Retail' },
    { code: '5942', description: 'Book Stores', category: 'Retail' },
    { code: '5943', description: 'Stationery Stores, Office and School Supply Stores', category: 'Retail' },
    { code: '5944', description: 'Jewelry Stores, Watches, Clocks, and Silverware Stores', category: 'Retail' },
    { code: '5945', description: 'Hobby, Toy, and Game Shops', category: 'Retail' },
    { code: '5946', description: 'Camera and Photographic Supply Stores', category: 'Retail' },
    { code: '5947', description: 'Gift, Card, Novelty, and Souvenir Shops', category: 'Retail' },
    { code: '5948', description: 'Luggage and Leather Goods Stores', category: 'Retail' },
    { code: '5949', description: 'Sewing, Needlework, Fabric, and Piece Goods Stores', category: 'Retail' },
    { code: '5950', description: 'Glassware and Crystal Stores', category: 'Retail' },
    { code: '5960', description: 'Direct Marketing - Insurance Services', category: 'Services' },
    { code: '5962', description: 'Direct Marketing - Travel Related Arrangements', category: 'Services' },
    { code: '5963', description: 'Door-to-Door Sales', category: 'Services' },
    { code: '5964', description: 'Direct Marketing - Catalog Merchant', category: 'Services' },
    { code: '5965', description: 'Direct Marketing - Combination Catalog and Retail', category: 'Services' },
    { code: '5966', description: 'Direct Marketing - Outbound Telemarketing', category: 'Services' },
    { code: '5967', description: 'Direct Marketing - Inbound Teleservices', category: 'Services' },
    { code: '5968', description: 'Direct Marketing - Continuity/Subscription Merchants', category: 'Services' },
    { code: '5969', description: 'Direct Marketing - Other', category: 'Services' },
    { code: '5970', description: 'Artist\'s Supply and Craft Shops', category: 'Retail' },
    { code: '5971', description: 'Art Dealers and Galleries', category: 'Retail' },
    { code: '5972', description: 'Stamp and Coin Stores', category: 'Retail' },
    { code: '5973', description: 'Religious Goods Stores', category: 'Retail' },
    { code: '5975', description: 'Hearing Aids - Sales, Service, and Supply Stores', category: 'Retail' },
    { code: '5976', description: 'Orthopedic Goods and Prosthetic Devices', category: 'Retail' },
    { code: '5977', description: 'Cosmetic Stores', category: 'Retail' },
    { code: '5978', description: 'Typewriter Stores', category: 'Retail' },
    { code: '5983', description: 'Fuel Dealers - Fuel Oil, Wood, Coal, Liquefied Petroleum', category: 'Retail' },
    { code: '5992', description: 'Florists', category: 'Retail' },
    { code: '5993', description: 'Cigar Stores and Stands', category: 'Retail' },
    { code: '5994', description: 'News Dealers and Newsstands', category: 'Retail' },
    { code: '5995', description: 'Pet Shops, Pet Food, and Supplies', category: 'Retail' },
    { code: '5996', description: 'Swimming Pools - Sales, Service, and Supplies', category: 'Retail' },
    { code: '5997', description: 'Electric Razor Stores', category: 'Retail' },
    { code: '5998', description: 'Tent and Awning Shops', category: 'Retail' },
    { code: '5999', description: 'Miscellaneous and Specialty Retail Stores', category: 'Retail' },
    
    // Financial Services
    { code: '6010', description: 'Financial Institutions - Manual Cash Disbursements', category: 'Financial' },
    { code: '6011', description: 'Financial Institutions - Automated Cash Disbursements', category: 'Financial' },
    { code: '6012', description: 'Financial Institutions - Merchandise and Services', category: 'Financial' },
    { code: '6051', description: 'Non-Financial Institutions - Foreign Currency, Money Orders', category: 'Financial' },
    { code: '6211', description: 'Security Brokers/Dealers', category: 'Financial' },
    { code: '6300', description: 'Insurance Sales, Underwriting, and Premiums', category: 'Financial' },
    { code: '6513', description: 'Real Estate Agents and Managers - Rentals', category: 'Real Estate' },
    
    // Business Services
    { code: '7011', description: 'Hotels, Motels, and Resorts', category: 'Hospitality' },
    { code: '7012', description: 'Timeshares', category: 'Hospitality' },
    { code: '7032', description: 'Sporting and Recreational Camps', category: 'Recreation' },
    { code: '7033', description: 'Trailer Parks and Campgrounds', category: 'Recreation' },
    { code: '7210', description: 'Laundry, Cleaning, and Garment Services', category: 'Services' },
    { code: '7211', description: 'Laundry Services - Family and Commercial', category: 'Services' },
    { code: '7216', description: 'Dry Cleaners', category: 'Services' },
    { code: '7217', description: 'Carpet and Upholstery Cleaning', category: 'Services' },
    { code: '7221', description: 'Photographic Studios', category: 'Services' },
    { code: '7230', description: 'Beauty and Barber Shops', category: 'Services' },
    { code: '7251', description: 'Shoe Repair Shops, Shoe Shine Parlors, Hat Cleaning Shops', category: 'Services' },
    { code: '7261', description: 'Funeral Services and Crematories', category: 'Services' },
    { code: '7273', description: 'Dating and Escort Services', category: 'Services' },
    { code: '7276', description: 'Tax Preparation Services', category: 'Services' },
    { code: '7277', description: 'Counseling Services - Debt, Marriage, Personal', category: 'Services' },
    { code: '7278', description: 'Buying/Shopping Services and Clubs', category: 'Services' },
    { code: '7296', description: 'Clothing Rental - Costumes, Uniforms, and Formal Wear', category: 'Services' },
    { code: '7297', description: 'Massage Parlors', category: 'Services' },
    { code: '7298', description: 'Health and Beauty Spas', category: 'Services' },
    { code: '7299', description: 'Miscellaneous Personal Services', category: 'Services' },
    { code: '7311', description: 'Advertising Services', category: 'Business Services' },
    { code: '7321', description: 'Consumer Credit Reporting Agencies', category: 'Business Services' },
    { code: '7333', description: 'Commercial Photography, Art and Graphics', category: 'Business Services' },
    { code: '7338', description: 'Quick Copy, Reproduction, and Blueprinting Services', category: 'Business Services' },
    { code: '7339', description: 'Stenographic and Secretarial Support Services', category: 'Business Services' },
    { code: '7342', description: 'Exterminating and Disinfecting Services', category: 'Business Services' },
    { code: '7349', description: 'Cleaning, Maintenance, and Janitorial Services', category: 'Business Services' },
    { code: '7361', description: 'Employment Agencies and Temporary Help Services', category: 'Business Services' },
    { code: '7372', description: 'Computer Programming, Data Processing, and Integrated Systems Design', category: 'Business Services' },
    { code: '7375', description: 'Information Retrieval Services', category: 'Business Services' },
    { code: '7379', description: 'Computer Maintenance, Repair, and Services', category: 'Business Services' },
    { code: '7392', description: 'Management, Consulting, and Public Relations Services', category: 'Business Services' },
    { code: '7393', description: 'Detective Agencies, Protective Agencies, Security Services', category: 'Business Services' },
    { code: '7394', description: 'Equipment, Tool, Furniture, and Appliance Rental and Leasing', category: 'Business Services' },
    { code: '7395', description: 'Photofinishing Laboratories and Photo Developing', category: 'Business Services' },
    { code: '7399', description: 'Business Services - Not Elsewhere Classified', category: 'Business Services' },
    
    // Repair Services
    { code: '7512', description: 'Automobile Rental Agency', category: 'Automotive' },
    { code: '7513', description: 'Truck and Utility Trailer Rentals', category: 'Automotive' },
    { code: '7519', description: 'Motor Home and Recreational Vehicle Rentals', category: 'Automotive' },
    { code: '7523', description: 'Parking Lots and Garages', category: 'Services' },
    { code: '7531', description: 'Automotive Body Repair Shops', category: 'Automotive' },
    { code: '7534', description: 'Tire Retreading and Repair Shops', category: 'Automotive' },
    { code: '7535', description: 'Automotive Paint Shops', category: 'Automotive' },
    { code: '7538', description: 'Automotive Service Shops', category: 'Automotive' },
    { code: '7542', description: 'Car Washes', category: 'Automotive' },
    { code: '7549', description: 'Towing Services', category: 'Automotive' },
    { code: '7622', description: 'Electronics Repair Shops', category: 'Services' },
    { code: '7623', description: 'Air Conditioning and Refrigeration Repair Shops', category: 'Services' },
    { code: '7629', description: 'Electrical and Small Appliance Repair Shops', category: 'Services' },
    { code: '7631', description: 'Watch, Clock, and Jewelry Repair', category: 'Services' },
    { code: '7641', description: 'Furniture - Reupholstery, Repair, and Refinishing', category: 'Services' },
    { code: '7692', description: 'Welding Services', category: 'Services' },
    { code: '7699', description: 'Miscellaneous Repair Shops and Related Services', category: 'Services' },
    
    // Entertainment
    { code: '7800', description: 'Government-Owned Lotteries', category: 'Entertainment' },
    { code: '7801', description: 'Government-Licensed On-Line Casinos', category: 'Entertainment' },
    { code: '7802', description: 'Government-Licensed Horse/Dog Racing', category: 'Entertainment' },
    { code: '7829', description: 'Motion Pictures and Video Tape Production and Distribution', category: 'Entertainment' },
    { code: '7832', description: 'Motion Picture Theaters', category: 'Entertainment' },
    { code: '7841', description: 'Video Tape Rental Stores', category: 'Entertainment' },
    { code: '7911', description: 'Dance Halls, Studios, and Schools', category: 'Entertainment' },
    { code: '7922', description: 'Theatrical Producers and Ticket Agencies', category: 'Entertainment' },
    { code: '7929', description: 'Bands, Orchestras, and Miscellaneous Entertainers', category: 'Entertainment' },
    { code: '7932', description: 'Billiard and Pool Establishments', category: 'Entertainment' },
    { code: '7933', description: 'Bowling Alleys', category: 'Entertainment' },
    { code: '7941', description: 'Sports Clubs/Fields - Athletic, Membership', category: 'Entertainment' },
    { code: '7991', description: 'Tourist Attractions and Exhibits', category: 'Entertainment' },
    { code: '7992', description: 'Golf Courses - Public', category: 'Entertainment' },
    { code: '7993', description: 'Video Amusement Game Supplies', category: 'Entertainment' },
    { code: '7994', description: 'Video Game Arcades and Establishments', category: 'Entertainment' },
    { code: '7995', description: 'Betting (including Lottery Tickets, Casino Gaming Chips)', category: 'Entertainment' },
    { code: '7996', description: 'Amusement Parks, Circuses, Carnivals, and Fortune Tellers', category: 'Entertainment' },
    { code: '7997', description: 'Membership Clubs (Sports, Recreation, Athletic)', category: 'Entertainment' },
    { code: '7998', description: 'Aquariums, Seaquariums, Dolphinariums', category: 'Entertainment' },
    { code: '7999', description: 'Recreation Services - Not Elsewhere Classified', category: 'Entertainment' },
    
    // Professional Services
    { code: '8011', description: 'Doctors and Physicians', category: 'Healthcare' },
    { code: '8021', description: 'Dentists and Orthodontists', category: 'Healthcare' },
    { code: '8031', description: 'Osteopaths', category: 'Healthcare' },
    { code: '8041', description: 'Chiropractors', category: 'Healthcare' },
    { code: '8042', description: 'Optometrists and Ophthalmologists', category: 'Healthcare' },
    { code: '8043', description: 'Opticians, Optical Goods, and Eyeglasses', category: 'Healthcare' },
    { code: '8049', description: 'Podiatrists and Chiropodists', category: 'Healthcare' },
    { code: '8050', description: 'Nursing and Personal Care Facilities', category: 'Healthcare' },
    { code: '8062', description: 'Hospitals', category: 'Healthcare' },
    { code: '8071', description: 'Medical and Dental Laboratories', category: 'Healthcare' },
    { code: '8099', description: 'Medical Services and Health Practitioners', category: 'Healthcare' },
    { code: '8111', description: 'Legal Services and Attorneys', category: 'Professional' },
    { code: '8211', description: 'Elementary and Secondary Schools', category: 'Education' },
    { code: '8220', description: 'Colleges, Universities', category: 'Education' },
    { code: '8241', description: 'Correspondence Schools', category: 'Education' },
    { code: '8244', description: 'Business and Secretarial Schools', category: 'Education' },
    { code: '8249', description: 'Vocational and Trade Schools', category: 'Education' },
    { code: '8299', description: 'Schools and Educational Services', category: 'Education' },
    { code: '8351', description: 'Child Care Services', category: 'Services' },
    { code: '8398', description: 'Charitable and Social Service Organizations', category: 'Non-Profit' },
    { code: '8641', description: 'Civic, Social, and Fraternal Associations', category: 'Non-Profit' },
    { code: '8651', description: 'Political Organizations', category: 'Non-Profit' },
    { code: '8661', description: 'Religious Organizations', category: 'Non-Profit' },
    { code: '8675', description: 'Automobile Associations', category: 'Non-Profit' },
    { code: '8699', description: 'Membership Organizations', category: 'Non-Profit' },
    { code: '8734', description: 'Testing Laboratories', category: 'Professional' },
    { code: '8911', description: 'Architectural, Engineering, and Surveying Services', category: 'Professional' },
    { code: '8931', description: 'Accounting, Auditing, and Bookkeeping Services', category: 'Professional' },
    { code: '8999', description: 'Professional Services', category: 'Professional' },
    
    // Government
    { code: '9211', description: 'Court Costs, Including Alimony and Child Support', category: 'Government' },
    { code: '9222', description: 'Fines', category: 'Government' },
    { code: '9223', description: 'Bail and Bond Payments', category: 'Government' },
    { code: '9311', description: 'Tax Payments', category: 'Government' },
    { code: '9399', description: 'Government Services', category: 'Government' },
    { code: '9402', description: 'Postal Services - Government Only', category: 'Government' },
    { code: '9405', description: 'Intra-Government Transactions', category: 'Government' },
];

export default function MCCSelector({ value, onChange, error }) {
    const [search, setSearch] = useState('');
    const [showList, setShowList] = useState(false);

    const filteredCodes = mccCodes.filter(mcc => 
        mcc.code.includes(search) || 
        mcc.description.toLowerCase().includes(search.toLowerCase()) ||
        mcc.category.toLowerCase().includes(search.toLowerCase())
    );

    const selectedMCC = mccCodes.find(m => m.code === value);

    return (
        <div className="space-y-2">
            <Label>Merchant Category Code (MCC) *</Label>
            <p className="text-xs text-slate-500">Search by code, description, or category</p>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowList(true);
                        }}
                        onFocus={() => setShowList(true)}
                        placeholder="Search MCC code, description, or category..."
                        className="pl-10"
                    />
                </div>
                
                {showList && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                        <ScrollArea className="h-80">
                            {filteredCodes.length > 0 ? (
                                filteredCodes.map((mcc) => (
                                    <button
                                        key={mcc.code}
                                        type="button"
                                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 ${value === mcc.code ? 'bg-blue-50' : ''}`}
                                        onClick={() => {
                                            onChange(mcc.code);
                                            setSearch('');
                                            setShowList(false);
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="font-mono text-sm font-semibold text-blue-600 min-w-[3rem]">{mcc.code}</span>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-900">{mcc.description}</p>
                                                <p className="text-xs text-slate-500">{mcc.category}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-slate-500">No matching MCC codes found</div>
                            )}
                        </ScrollArea>
                        <div className="border-t p-2 bg-slate-50">
                            <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowList(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {selectedMCC && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold text-blue-700">{selectedMCC.code}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{selectedMCC.category}</span>
                        </div>
                        <p className="text-sm text-slate-700">{selectedMCC.description}</p>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error}
                </p>
            )}
        </div>
    );
}