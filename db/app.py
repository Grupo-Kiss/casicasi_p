from flask import Flask, render_template, jsonify, request
import pandas as pd
import os

app = Flask(__name__)

# Path to your CSV file
CSV_FILE = 'db_25_casicasi - casicasi2.csv'
# Global variable to store DataFrame
df = pd.DataFrame()

def load_data():
    global df
    try:
        # Ensure the path is correct relative to the app.py location
        df = pd.read_csv(CSV_FILE)
        print(f"Data loaded successfully from {CSV_FILE}. Shape: {df.shape}")
    except FileNotFoundError:
        print(f"Error: {CSV_FILE} not found. Please ensure it's in the same directory as app.py.")
        df = pd.DataFrame() # Initialize empty DataFrame on error
    except Exception as e:
        print(f"An error occurred while loading data: {e}")
        df = pd.DataFrame() # Initialize empty DataFrame on error

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data', methods=['GET'])
def get_data():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)

    start = (page - 1) * per_page
    end = start + per_page

    paginated_df = df.iloc[start:end]
    total_records = len(df)

    return jsonify({
        'data': paginated_df.to_dict(orient='records'),
        'total_records': total_records
    })

@app.route('/data', methods=['POST'])
def add_data():
    global df
    new_record = request.json
    if new_record:
        # Append new record to DataFrame
        df = pd.concat([df, pd.DataFrame([new_record])], ignore_index=True)
        # In a real application, you'd save this back to CSV or a database
        # For now, it's in-memory
        return jsonify({"message": "Record added successfully", "data": new_record}), 201
    return jsonify({"error": "Invalid data"}), 400

@app.route('/data/<int:row_id>', methods=['PUT'])
def update_data(row_id):
    global df
    updated_record = request.json
    if row_id < len(df):
        # Update record by index
        for key, value in updated_record.items():
            if key in df.columns:
                df.at[row_id, key] = value
        # In a real application, you'd save this back to CSV or a database
        return jsonify({"message": "Record updated successfully", "data": df.iloc[row_id].to_dict()})
    return jsonify({"error": "Record not found"}), 404

@app.route('/data/<int:row_id>', methods=['DELETE'])
def delete_data(row_id):
    global df
    if row_id < len(df):
        # Delete record by index
        df = df.drop(index=row_id).reset_index(drop=True)
        # In a real application, you'd save this back to CSV or a database
        return jsonify({"message": "Record deleted successfully"})
    return jsonify({"error": "Record not found"}), 404

@app.route('/export', methods=['GET'])
def export_data():
    # Export DataFrame to JSON
    # For the game, it might need a specific structure,
    # but for now, a simple records orientation is used.
    return jsonify(df.to_dict(orient='records'))

if __name__ == '__main__':
    load_data() # Call load_data once at startup
    app.run(debug=True)