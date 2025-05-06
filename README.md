# Remove the existing .git directory (this deletes all Git history)
rm -rf .git

# Create a new README.md file
echo "# pharmacy-care" > README.md

# Initialize a new Git repository
git init

# Add the README file
git add README.md

# Commit the README file
git commit -m "first commit"

# Rename the default branch to main
git branch -M main

# Add the new remote repository
git remote add origin https://github.com/jakir-hossen-4928/pharmacy-care.git

# Push to the remote repository
git push -u origin main