INSERT INTO categories (name, description) VALUES
    ('Lumber', 'Dimensional lumber, plywood, and sheet goods'),
    ('Garden', 'Plants, soil, fertilizers, and outdoor supplies'),
    ('Electrical', 'Wiring, outlets, switches, and lighting fixtures'),
    ('Plumbing', 'Pipes, fittings, fixtures, and water heaters'),
    ('Tools', 'Hand tools, power tools, and accessories'),
    ('Paint', 'Interior and exterior paints, stains, and supplies');

INSERT INTO products (name, sku, category_id, price, quantity, low_stock_threshold, description) VALUES
    ('2x4 Lumber 8ft', 'LUM-2X4-8FT', 1, 5.98, 342, 50, 'Kiln-dried whitewood stud grade lumber'),
    ('3/4" Plywood Sheet 4x8', 'LUM-PLY-3/4', 1, 52.99, 78, 20, 'Sanded pine plywood sheet'),
    ('Pressure Treated 4x4 10ft', 'LUM-4X4-PT10', 1, 18.47, 8, 15, 'Ground contact rated pressure treated post'),
    ('Potting Soil 2 cu ft', 'GRD-SOIL-2CF', 2, 8.99, 156, 30, 'All-purpose organic potting mix'),
    ('Tomato Cage 54"', 'GRD-CAGE-54', 2, 4.49, 3, 20, 'Heavy duty galvanized tomato support cage'),
    ('Garden Hose 50ft', 'GRD-HOSE-50', 2, 29.99, 64, 15, 'Kink-resistant flexible garden hose with brass fittings'),
    ('12/2 Romex Wire 250ft', 'ELC-ROM-12/2', 3, 89.97, 41, 10, 'Non-metallic sheathed cable for interior wiring'),
    ('GFCI Outlet 15A', 'ELC-GFCI-15', 3, 14.98, 6, 25, 'Tamper resistant ground fault circuit interrupter outlet'),
    ('LED Shop Light 4ft', 'ELC-LED-4FT', 3, 34.99, 93, 15, '5000K daylight linkable LED shop light'),
    ('1/2" PVC Pipe 10ft', 'PLM-PVC-1/2', 4, 3.49, 220, 40, 'Schedule 40 PVC pressure pipe'),
    ('Kitchen Faucet Brushed Nickel', 'PLM-FAU-KBN', 4, 149.00, 12, 5, 'Single handle pull-down kitchen faucet'),
    ('Wax Ring Toilet Seal', 'PLM-WAX-STD', 4, 4.29, 4, 15, 'Standard wax ring with flange for toilet installation'),
    ('20V Cordless Drill Kit', 'TLS-DRL-20V', 5, 129.00, 28, 8, 'Brushless cordless drill/driver with two batteries and charger'),
    ('25ft Tape Measure', 'TLS-TAP-25', 5, 12.97, 2, 20, 'Heavy duty tape measure with magnetic tip'),
    ('10" Miter Saw', 'TLS-MIT-10', 5, 249.00, 14, 5, 'Compound miter saw with laser guide'),
    ('Adjustable Wrench 10"', 'TLS-WRN-10', 5, 11.98, 47, 10, 'Chrome vanadium adjustable wrench'),
    ('Interior Latex Paint 1gal White', 'PNT-INT-1GW', 6, 34.98, 85, 20, 'Eggshell finish interior latex wall paint'),
    ('Exterior Semi-Gloss 1gal', 'PNT-EXT-1GS', 6, 42.98, 38, 15, 'Acrylic latex exterior paint with UV protection'),
    ('Wood Stain 1qt Golden Oak', 'PNT-STN-GOK', 6, 14.98, 7, 10, 'Oil-based penetrating wood stain'),
    ('Paint Roller Kit 9"', 'PNT-ROL-9KT', 6, 9.98, 112, 25, 'Roller frame, cover, and paint tray set');
