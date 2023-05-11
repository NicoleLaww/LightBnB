INSERT INTO users (id, name, email, password)
VALUES (1, 'Nikki Le', 'nikki15@gmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
(2, 'Pooh Bear', 'winniethepoohthebear@gmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
(3, 'Eva Stanley', ' sebastianguerra@ymail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.');

INSERT INTO properties (id, owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active)
VALUES (1, 1, 'Speed lamp', 'description', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg', 930.61, 6, 4, 8, 'Canada', '536 Namsub Highway', 'Sotboske', 'Quebec', 28142, true),
(2, 1, 'Burrow', 'description', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg',  0.50, 0, 0, 0, 'Canada', 'Forest', 'Outside', 'Ontario', 374923, true),
(3, 2, 'Trash Can', 'description', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg',  0.20, 0, 0, 0, 'Canada', 'Street', 'Markham', 'Ontario', 345223, true);

INSERT INTO reservations (id, start_date, end_date, property_id, guest_id)
VALUES (1, '2023-05-11','2023-06-11', 2, 3),
(2, '2023-05-11','2023-06-11', 2, 2),
(3, '2023-05-11','2023-06-11', 1, 3);

INSERT INTO property_reviews (id, guest_id, property_id, reservation_id, rating, message)
VALUES (1, 3, 2, 1, 3, 'message'),
(2, 2, 2, 2, 4, 'message'), 
(3, 3, 1, 3, 4, 'message');