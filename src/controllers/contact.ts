import ContactForm from "../models/contact";
import { Request, Response } from "express";

/**
 * Create a new contact form submission
 * Public endpoint - anyone can submit
 */
export const createContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, message",
      });
      return;
    }

    // Get user ID from request (set by authenticate middleware) - optional
    const userId = req.userId || undefined;

    // Create contact form submission
    const contactData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      status: "new",
    };

    if (phone) {
      contactData.phone = phone.trim();
    }

    if (subject) {
      contactData.subject = subject.trim();
    } else {
      contactData.subject = "General Inquiry";
    }

    if (userId) {
      contactData.userId = userId;
    }

    const newContact = new ContactForm(contactData);
    const savedContact = await newContact.save();

    // Populate user if exists
    if (userId) {
      await savedContact.populate("userId", "firstName lastName email");
    }

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully. We'll get back to you soon!",
      data: { contact: savedContact },
    });
  } catch (error: any) {
    console.log("Error creating contact form:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors: Record<string, string> = {};

      if (error.errors) {
        Object.keys(error.errors).forEach((key) => {
          const fieldError = error.errors[key];
          validationErrors[key] = fieldError.message;
        });
      }

      res.status(400).json({
        success: false,
        message: "Validation failed. Please check your input.",
        errors: validationErrors,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong during contact form submission",
      error: error.message,
    });
  }
};

/**
 * Get all contact form submissions (Admin only)
 * Admins can view all contact form submissions
 */
export const getContactForms = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const contacts = await ContactForm.find(filter)
      .populate("userId", "firstName lastName email")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await ContactForm.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.log("Error fetching contact forms:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * Get single contact form by ID (Admin only)
 */
export const getContactFormById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await ContactForm.findById(id).populate(
      "userId",
      "firstName lastName email"
    );

    if (!contact) {
      res.status(404).json({
        success: false,
        message: "Contact form submission not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { contact },
    });
  } catch (error: any) {
    console.log("Error fetching contact form:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * Update contact form status (Admin only)
 */
export const updateContactFormStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["new", "read", "replied", "archived"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: new, read, replied, archived",
      });
      return;
    }

    const contact = await ContactForm.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId", "firstName lastName email");

    if (!contact) {
      res.status(404).json({
        success: false,
        message: "Contact form submission not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Contact form status updated successfully",
      data: { contact },
    });
  } catch (error: any) {
    console.log("Error updating contact form:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * Delete contact form submission (Admin only)
 */
export const deleteContactForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await ContactForm.findByIdAndDelete(id);

    if (!contact) {
      res.status(404).json({
        success: false,
        message: "Contact form submission not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Contact form submission deleted successfully",
    });
  } catch (error: any) {
    console.log("Error deleting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
