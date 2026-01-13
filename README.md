# Blog Platform
A full-featured blogging platform built with Node.js, enabling users to create, edit, and manage blog posts with a clean and intuitive interface.

## Features

- Create, read, update, and delete blog posts
- - User authentication and authorization
  - - Rich text editor for content creation
    - - Responsive design for all devices
      - - Comment system for reader engagement
        - - Category and tag management
          - ## Tech Stack
         
          - - **Backend**: Node.js, Express.js
            - - **Database**: MongoDB
              - - **Frontend**: EJS templates
                - - **Authentication**: Passport.js
                  - - **Styling**: CSS
                   
                    - ## Getting Started
                   
                    - ```bash
                      # Clone the repository
                      git clone https://github.com/Faizal-Malek/Blog-Node.git

                      # Install dependencies
                      cd Blog-Node
                      npm install
                      ```
                      # Set up environment variables
                      # Create a .env file with:
                      # DATABASE_URL=your_mongodb_connection_string
                      # SESSION_SECRET=your_session_secret

                      # Start the server
                      npm start
                      ```

                      ## API Endpoints

                      - `GET /posts` - Get all blog posts
                      - `POST /posts` - Create a new post
                      - `GET /posts/:id` - Get a specific post
                      - `PUT /posts/:id` - Update a post
                      - `DELETE /posts/:id` - Delete a post
                      
